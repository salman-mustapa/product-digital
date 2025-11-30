const Sync = {
    isSyncing: false,

    async syncData() {
        if (!navigator.onLine) {
            alert('Anda sedang offline. Koneksi internet diperlukan untuk sinkronisasi.');
            return;
        }
        if (this.isSyncing) return;
        this.isSyncing = true;
        UI.Layout.showSyncLoader(true);

        try {
            // 1. Gather Local Data
            const payload = {
                users: DB.get(DB.USERS),
                outlets: DB.get(DB.OUTLETS),
                categories: DB.get(DB.CATEGORIES),
                products: DB.get(DB.PRODUCTS),
                transactions: DB.get(DB.TRANSACTIONS)
            };

            // 2. Send to Backend
            const response = await API.request('sync', payload, 'POST');

            if (response.success) {
                // 3. Merge Remote Data to Local
                const remote = response.data;

                DB.merge(DB.USERS, remote.users || []);
                DB.merge(DB.OUTLETS, remote.outlets || []);
                DB.merge(DB.CATEGORIES, remote.categories || []);
                DB.merge(DB.PRODUCTS, remote.products || []);
                DB.merge(DB.PRODUCTS, remote.products || []);
                DB.merge(DB.TRANSACTIONS, remote.transactions || []);

                console.log('Sync Complete. Remote Data:', remote);
                console.log('Local Users after sync:', DB.get(DB.USERS));

                // 4. Update Last Sync Time
                localStorage.setItem('last_sync_time', new Date().toISOString());
                UI.Layout.updateSyncStatus('online');

                // 5. Refresh UI
                const currentView = localStorage.getItem('current_view') || 'dashboard';
                const mainContent = document.getElementById('main-content');

                if (!mainContent) {
                    // If we are in Setup mode (no main-content), we must reload to restore full layout
                    window.location.reload();
                } else if (typeof UI !== 'undefined' && UI.navigate) {
                    UI.navigate(currentView);
                }
            } else {
                throw new Error(response.message || 'Sync failed');
            }

        } catch (error) {
            console.error('Sync Error:', error);
            if (UI && UI.Layout && UI.Layout.updateSyncStatus) {
                UI.Layout.updateSyncStatus('error');
            }
            alert('Sync Failed: ' + error.message);
        } finally {
            this.isSyncing = false;
            if (UI && UI.Layout && UI.Layout.showSyncLoader) {
                UI.Layout.showSyncLoader(false);
            }
        }
    }
};
