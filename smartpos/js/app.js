const App = {
    products: [],
    cart: [],
    transactions: [],
    syncInterval: null,
    checkInterval: null,

    init() {
        API.init();
        UI.init();

        // Update offline indicator
        window.addEventListener('online', () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));
        this.handleConnectionChange(navigator.onLine);

        // Periodic Sync (Every 1 hour)
        this.syncInterval = setInterval(() => {
            console.log('Periodic sync triggered');
            API.sync();
        }, 60 * 60 * 1000);

        // Periodic Connection Check (Every 1 minute)
        this.checkInterval = setInterval(() => {
            if (navigator.onLine && !API.isSyncing) {
                // Try a lightweight check or just sync if queue has items
                const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
                if (queue.length > 0) API.sync();
            }
        }, 60 * 1000);
    },

    handleConnectionChange(isOnline) {
        const indicator = document.getElementById('offline-indicator');
        const syncStatus = document.getElementById('sync-status-container');

        if (isOnline) {
            indicator.classList.add('hidden');
            if (syncStatus) syncStatus.classList.remove('hidden');
            API.sync(); // Auto sync on reconnect
        } else {
            indicator.classList.remove('hidden');
            if (syncStatus) syncStatus.classList.add('hidden');
        }

        UI.updateSyncStatus(isOnline ? 'online' : 'offline');
    },

    refreshData() {
        // Called after sync to update UI with latest data
        if (UI.currentView === 'home') this.loadHomeStats();
        if (UI.currentView === 'produk') this.loadProducts();
        if (UI.currentView === 'transaksi') this.loadPosProducts();
        if (UI.currentView === 'laporan') this.loadTransactions();
    },

    async loadHomeStats() {
        try {
            const resProd = await API.request('getProducts');
            const resTrans = await API.request('getTransactions');

            if (resProd.success) {
                this.products = resProd.data;
                document.getElementById('home-total-products').textContent = this.products.length;
            }

            if (resTrans.success) {
                this.transactions = resTrans.data;
                // Filter today's transactions
                const today = new Date().toDateString();
                const todayTrans = this.transactions.filter(t => new Date(t.date).toDateString() === today);
                document.getElementById('home-today-transactions').textContent = todayTrans.length;
            }
        } catch (error) {
            console.error('Failed to load stats', error);
        }
    },

    async loadProducts() {
        const list = document.getElementById('product-list');
        list.innerHTML = '<div class="text-center py-10 text-gray-500"><div class="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>Memuat...</div>';

        try {
            const response = await API.request('getProducts');
            if (response.success) {
                this.products = response.data;
                this.renderProductList(this.products);
            } else {
                list.innerHTML = '<div class="text-center text-red-500">Gagal memuat produk</div>';
            }
        } catch (error) {
            list.innerHTML = `<div class="text-center text-red-500">Error: ${error.message}</div>`;
        }
    },

    renderProductList(products) {
        const list = document.getElementById('product-list');
        list.innerHTML = '';
        if (products.length === 0) {
            list.innerHTML = '<div class="text-center py-10 text-gray-400">Belum ada produk</div>';
            return;
        }
        products.forEach(p => {
            list.innerHTML += UI.renderProductItem(p);
        });
    },

    filterProducts(keyword) {
        const filtered = this.products.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
        this.renderProductList(filtered);
    },

    async saveProduct(data) {
        try {
            const response = await API.request('saveProduct', data, 'POST');
            if (response.success) {
                // Refresh list
                this.loadProducts();
                // If on home, refresh stats
                if (UI.currentView === 'home') this.loadHomeStats();
            } else {
                alert('Gagal menyimpan produk');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    },

    async deleteProduct(id) {
        if (!confirm('Hapus produk ini?')) return;
        try {
            const response = await API.request('deleteProduct', { id }, 'POST');
            if (response.success) {
                this.loadProducts();
            } else {
                alert('Gagal menghapus produk');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    },

    // POS Logic
    async loadPosProducts() {
        // Ensure products are loaded
        if (this.products.length === 0) {
            const response = await API.request('getProducts');
            if (response.success) this.products = response.data;
        }

        const list = document.getElementById('pos-product-list');
        list.innerHTML = '';
        this.products.forEach(p => {
            list.innerHTML += UI.renderPosProductItem(p);
        });
    },

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);

        // Stock Check
        const currentInCart = this.cart.find(item => item.id === productId);
        const currentQty = currentInCart ? currentInCart.qty : 0;

        if (product.stock <= currentQty) {
            alert('Stok tidak mencukupi!');
            return;
        }

        if (currentInCart) {
            currentInCart.qty++;
        } else {
            this.cart.push({ ...product, qty: 1 });
        }
        this.updateCartUI();
    },

    updateCartQty(productId, change) {
        const index = this.cart.findIndex(item => item.id === productId);
        if (index === -1) return;

        const item = this.cart[index];
        const product = this.products.find(p => p.id === productId);

        // Stock Check for increase
        if (change > 0 && item.qty >= product.stock) {
            alert('Stok tidak mencukupi!');
            return;
        }

        this.cart[index].qty += change;
        if (this.cart[index].qty <= 0) {
            this.cart.splice(index, 1);
        }

        this.updateCartUI();
        // Re-render modal if open
        if (document.getElementById('modal-container').children.length > 0) {
            UI.showCartModal();
        }
    },

    updateCartUI() {
        const badge = document.getElementById('cart-badge');
        const count = document.getElementById('cart-count');
        const totalEl = document.getElementById('cart-total');

        const totalQty = this.cart.reduce((sum, item) => sum + item.qty, 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

        if (totalQty > 0) {
            badge.classList.remove('hidden');
            badge.textContent = totalQty;
        } else {
            badge.classList.add('hidden');
        }

        if (count) count.textContent = totalQty;
        if (totalEl) totalEl.textContent = 'Rp ' + totalPrice.toLocaleString('id-ID');
    },

    async processTransaction() {
        if (this.cart.length === 0) return;

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const transaction = {
            items: this.cart,
            total: total,
            paymentMethod: 'cash' // Default for now
        };

        try {
            const response = await API.request('saveTransaction', transaction, 'POST');
            if (response.success) {
                alert('Transaksi Berhasil!');
                this.cart = [];
                this.updateCartUI();
                document.getElementById('modal-container').innerHTML = '';

                // Refresh data to update stock locally
                if (response.message && response.message.includes('Offline')) {
                    // Manual local update already done by API.updateLocalCache
                    this.loadPosProducts();
                } else {
                    this.refreshData();
                }

                UI.switchView('home');
            } else {
                alert('Transaksi Gagal');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    },

    async loadTransactions() {
        const list = document.getElementById('transaction-history');
        try {
            const response = await API.request('getTransactions');
            if (response.success) {
                const transactions = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                list.innerHTML = '';
                if (transactions.length === 0) {
                    list.innerHTML = '<div class="text-center text-gray-400">Belum ada transaksi</div>';
                    return;
                }
                transactions.forEach(t => {
                    list.innerHTML += UI.renderTransactionItem(t);
                });
            }
        } catch (error) {
            list.innerHTML = `<div class="text-center text-red-500">Error: ${error.message}</div>`;
        }
    }
};

// Start App
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
