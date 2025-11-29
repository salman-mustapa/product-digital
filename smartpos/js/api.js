const API = {
    // Configuration
    APPSCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwh_8TurNXzbVgC1dCCTDmOu63lsb5DoLTk_-EZXyaYdcH-KDQysuPLbTrquGBhZW1q/exec',
    USE_MOCK: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:',

    // State
    isSyncing: false,
    lastSyncTime: localStorage.getItem('last_sync_time') || null,

    // Initialize
    init() {
        console.log(`API Initialized. Mode: ${this.USE_MOCK ? 'MOCK' : 'ONLINE (AppScript)'}`);
        if (!this.USE_MOCK && !this.APPSCRIPT_URL) {
            console.warn('AppScript URL is missing. Please configure it in js/api.js');
        }

        // Initial Sync if online
        if (navigator.onLine && !this.USE_MOCK) {
            this.sync();
        }
    },

    // Generic Request Handler
    async request(action, data = null, method = 'GET') {
        if (this.USE_MOCK) {
            return this.mockRequest(action, data);
        }

        // Offline Mutation Handling
        if (!navigator.onLine && method === 'POST') {
            return this.addToSyncQueue(action, data);
        }

        // Online GET: Try Cache first if available and fresh (e.g. < 5 mins old)
        // For now, we always fetch fresh for GET unless offline
        if (!navigator.onLine && method === 'GET') {
            return this.offlineFallback(action, data);
        }

        try {
            const url = new URL(this.APPSCRIPT_URL);
            url.searchParams.append('action', action);

            const options = {
                method: method,
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            };

            if (method === 'POST' && data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url.toString(), options);
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();

            // Cache successful GET responses
            if (method === 'GET' && result.success) {
                localStorage.setItem(`cache_${action}`, JSON.stringify(result.data));
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            // Fallback to local storage if offline or error
            if (method === 'POST') {
                return this.addToSyncQueue(action, data);
            }
            return this.offlineFallback(action, data);
        }
    },

    // Sync Queue Logic
    addToSyncQueue(action, data) {
        console.log('Adding to sync queue:', action);
        const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
        const id = data.id || (action === 'saveTransaction' ? 't' + Date.now() : 'p' + Date.now());
        const item = { action, data: { ...data, id }, timestamp: Date.now() };

        queue.push(item);
        localStorage.setItem('sync_queue', JSON.stringify(queue));

        // Optimistic UI Update
        this.updateLocalCache(action, item.data);

        return { success: true, data: item.data, message: 'Saved offline (Sync Pending)' };
    },

    updateLocalCache(action, data) {
        if (action === 'saveProduct') {
            let products = JSON.parse(localStorage.getItem('cache_getProducts') || '[]');
            const index = products.findIndex(p => p.id === data.id);
            if (index >= 0) products[index] = data;
            else products.push(data);
            localStorage.setItem('cache_getProducts', JSON.stringify(products));
        } else if (action === 'deleteProduct') {
            let products = JSON.parse(localStorage.getItem('cache_getProducts') || '[]');
            products = products.filter(p => p.id !== data.id);
            localStorage.setItem('cache_getProducts', JSON.stringify(products));
        } else if (action === 'saveTransaction') {
            let transactions = JSON.parse(localStorage.getItem('cache_getTransactions') || '[]');
            transactions.push({ ...data, date: new Date().toISOString() });
            localStorage.setItem('cache_getTransactions', JSON.stringify(transactions));

            // Deduct stock in local cache
            let products = JSON.parse(localStorage.getItem('cache_getProducts') || '[]');
            data.items.forEach(item => {
                const pIndex = products.findIndex(p => p.id === item.id);
                if (pIndex >= 0) {
                    products[pIndex].stock = Math.max(0, (products[pIndex].stock || 0) - item.qty);
                }
            });
            localStorage.setItem('cache_getProducts', JSON.stringify(products));
        }
    },

    async sync() {
        if (this.isSyncing || !navigator.onLine || this.USE_MOCK) return;

        this.isSyncing = true;
        UI.updateSyncStatus('syncing');

        try {
            // 1. Process Queue
            const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
            if (queue.length > 0) {
                console.log(`Processing ${queue.length} items from sync queue...`);

                // Process sequentially
                for (const item of queue) {
                    try {
                        const url = new URL(this.APPSCRIPT_URL);
                        url.searchParams.append('action', item.action);
                        await fetch(url.toString(), {
                            method: 'POST',
                            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                            body: JSON.stringify(item.data)
                        });
                    } catch (e) {
                        console.error('Sync item failed', e);
                        // Keep in queue? For now we remove to avoid blocking, or could implement retry count
                    }
                }

                localStorage.setItem('sync_queue', '[]');
            }

            // 2. Fetch Latest Data
            const resProd = await this.request('getProducts', null, 'GET');
            const resTrans = await this.request('getTransactions', null, 'GET');

            this.lastSyncTime = new Date().toISOString();
            localStorage.setItem('last_sync_time', this.lastSyncTime);
            UI.updateSyncStatus('online');

            // Refresh UI if needed
            if (App) App.refreshData();

        } catch (error) {
            console.error('Sync failed', error);
            UI.updateSyncStatus('error');
        } finally {
            this.isSyncing = false;
        }
    },

    // Mock Request Handler (Updated with Stock)
    async mockRequest(action, data) {
        await new Promise(resolve => setTimeout(resolve, 500));

        let products = JSON.parse(localStorage.getItem('mock_products'));
        let transactions = JSON.parse(localStorage.getItem('mock_transactions')) || [];

        if (!products) {
            try {
                const response = await fetch('mock_data.json');
                const json = await response.json();
                products = json.products.map(p => ({ ...p, stock: 100 })); // Default stock for mock
                transactions = json.transactions;
                localStorage.setItem('mock_products', JSON.stringify(products));
                localStorage.setItem('mock_transactions', JSON.stringify(transactions));
            } catch (e) {
                products = [];
            }
        }

        switch (action) {
            case 'getProducts':
                return { success: true, data: products };

            case 'saveProduct':
                const newProduct = { ...data, id: data.id || 'p' + Date.now(), stock: parseInt(data.stock || 0) };
                const index = products.findIndex(p => p.id === newProduct.id);
                if (index >= 0) products[index] = newProduct;
                else products.push(newProduct);
                localStorage.setItem('mock_products', JSON.stringify(products));
                return { success: true, data: newProduct };

            case 'deleteProduct':
                products = products.filter(p => p.id !== data.id);
                localStorage.setItem('mock_products', JSON.stringify(products));
                return { success: true };

            case 'saveTransaction':
                const transaction = { ...data, id: 't' + Date.now(), date: new Date().toISOString() };
                transactions.push(transaction);

                // Deduct Mock Stock
                data.items.forEach(item => {
                    const p = products.find(p => p.id === item.id);
                    if (p) p.stock = Math.max(0, p.stock - item.qty);
                });

                localStorage.setItem('mock_transactions', JSON.stringify(transactions));
                localStorage.setItem('mock_products', JSON.stringify(products));
                return { success: true, data: transaction };

            case 'getTransactions':
                return { success: true, data: transactions };

            default:
                return { success: false, message: 'Unknown action' };
        }
    },

    // Offline Fallback
    offlineFallback(action, data) {
        console.log('Offline mode active. Using Cache.');
        if (action === 'getProducts') {
            const cached = localStorage.getItem('cache_getProducts');
            return { success: true, data: cached ? JSON.parse(cached) : [] };
        }
        if (action === 'getTransactions') {
            const cached = localStorage.getItem('cache_getTransactions');
            return { success: true, data: cached ? JSON.parse(cached) : [] };
        }
        return { success: false, message: 'Offline' };
    }
};
