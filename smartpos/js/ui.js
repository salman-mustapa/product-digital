const UI = {
    // Current View State
    currentView: 'home',

    init() {
        this.setupNavigation();
        this.renderHome();
        this.setupTheme();
    },

    setupNavigation() {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = btn.dataset.target;
                this.switchView(target);

                // Update active state
                navBtns.forEach(b => {
                    b.classList.remove('text-primary-600', 'dark:text-primary-400');
                    b.classList.add('text-gray-400');
                });
                btn.classList.remove('text-gray-400');
                btn.classList.add('text-primary-600', 'dark:text-primary-400');
            });
        });
    },

    switchView(viewName) {
        this.currentView = viewName;
        const container = document.getElementById('app-container');
        container.innerHTML = ''; // Clear current content

        switch (viewName) {
            case 'home':
                this.renderHome();
                break;
            case 'produk':
                this.renderProduk();
                break;
            case 'transaksi':
                this.renderTransaksi();
                break;
            case 'laporan':
                this.renderLaporan();
                break;
        }
    },

    setupTheme() {
        const toggleBtn = document.getElementById('theme-toggle');
        const sunIcon = document.getElementById('theme-icon-sun');
        const moonIcon = document.getElementById('theme-icon-moon');
        const html = document.documentElement;

        // Check saved theme or system preference
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            html.classList.add('dark');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            html.classList.remove('dark');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }

        toggleBtn.addEventListener('click', () => {
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.theme = 'light';
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            } else {
                html.classList.add('dark');
                localStorage.theme = 'dark';
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            }
        });
    },

    updateSyncStatus(status) {
        // Status: 'online', 'offline', 'syncing', 'error'
        const container = document.querySelector('header .flex.items-center.gap-3');
        let statusEl = document.getElementById('sync-status-container');

        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'sync-status-container';
            statusEl.className = 'flex items-center gap-2 mr-2';
            container.insertBefore(statusEl, container.firstChild);
        }

        let html = '';
        if (status === 'syncing') {
            html = `
                <div class="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <svg class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Syncing...
                </div>
            `;
        } else if (status === 'offline') {
            // Handled by offline-indicator in HTML, but we can add manual sync button here if needed
            html = ``;
        } else if (status === 'error') {
            html = `
                <button onclick="API.sync()" class="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full hover:bg-red-100">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Sync Error
                </button>
            `;
        } else {
            // Online / Idle
            html = `
                <button onclick="API.sync()" class="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full hover:bg-green-100 transition-colors" title="Last Sync: ${new Date().toLocaleTimeString()}">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    Online
                </button>
            `;
        }

        statusEl.innerHTML = html;
    },

    // --- RENDER FUNCTIONS ---

    renderHome() {
        const container = document.getElementById('app-container');
        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <div class="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 text-white shadow-lg">
                    <h2 class="text-2xl font-bold mb-2">Selamat Datang!</h2>
                    <p class="opacity-90">Kelola usaha UMKM kamu dengan mudah.</p>
                    <div class="mt-6 flex gap-4">
                        <div class="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex-1 text-center">
                            <p class="text-xs opacity-80">Total Produk</p>
                            <p class="text-xl font-bold" id="home-total-products">-</p>
                        </div>
                        <div class="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex-1 text-center">
                            <p class="text-xs opacity-80">Transaksi Hari Ini</p>
                            <p class="text-xl font-bold" id="home-today-transactions">-</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <button onclick="UI.switchView('transaksi'); document.querySelector('[data-target=transaksi]').click()" class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all">
                        <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        </div>
                        <span class="font-semibold">Transaksi Baru</span>
                    </button>
                    <button onclick="UI.switchView('produk'); document.querySelector('[data-target=produk]').click()" class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all">
                        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                        </div>
                        <span class="font-semibold">Kelola Produk</span>
                    </button>
                </div>
            </div>
        `;

        // Load stats
        App.loadHomeStats();
    },

    renderProduk() {
        const container = document.getElementById('app-container');
        container.innerHTML = `
            <div class="space-y-4 animate-fade-in">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Daftar Produk</h2>
                    <button onclick="UI.showProductModal()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Tambah
                    </button>
                </div>

                <div class="relative">
                    <input type="text" id="search-product" placeholder="Cari produk..." class="w-full pl-10 pr-4 py-3 rounded-xl border-none bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-primary-500 dark:text-white">
                    <svg class="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                <div id="product-list" class="grid gap-3 pb-20">
                    <!-- Products will be loaded here -->
                    <div class="text-center py-10 text-gray-500">Memuat produk...</div>
                </div>
            </div>
        `;

        App.loadProducts();

        // Search listener
        document.getElementById('search-product').addEventListener('input', (e) => {
            App.filterProducts(e.target.value);
        });
    },

    renderProductItem(product) {
        return `
            <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <h3 class="font-semibold text-lg dark:text-white">${product.name}</h3>
                    <div class="flex items-center gap-2">
                        <p class="text-primary-600 dark:text-primary-400 font-medium">Rp ${parseInt(product.price).toLocaleString('id-ID')}</p>
                        <span class="text-xs text-gray-500">•</span>
                        <p class="text-xs ${product.stock > 0 ? 'text-gray-500' : 'text-red-500 font-bold'}">Stok: ${product.stock}</p>
                    </div>
                    <span class="text-xs text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full mt-1 inline-block">${product.category}</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="UI.showProductModal('${product.id}')" class="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button onclick="App.deleteProduct('${product.id}')" class="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        `;
    },

    showProductModal(productId = null) {
        const product = productId ? App.products.find(p => p.id === productId) : null;
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl transform transition-all animate-slide-up">
                <h3 class="text-xl font-bold mb-4 dark:text-white">${product ? 'Edit Produk' : 'Tambah Produk'}</h3>
                <form id="product-form" class="space-y-4">
                    <input type="hidden" name="id" value="${product ? product.id : ''}">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Produk</label>
                        <input type="text" name="name" required value="${product ? product.name : ''}" class="w-full rounded-lg border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga</label>
                            <input type="number" name="price" required value="${product ? product.price : ''}" class="w-full rounded-lg border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stok</label>
                            <input type="number" name="stock" required value="${product ? product.stock : '0'}" class="w-full rounded-lg border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white focus:ring-primary-500 focus:border-primary-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                        <select name="category" class="w-full rounded-lg border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white focus:ring-primary-500 focus:border-primary-500">
                            <option value="Makanan" ${product && product.category === 'Makanan' ? 'selected' : ''}>Makanan</option>
                            <option value="Minuman" ${product && product.category === 'Minuman' ? 'selected' : ''}>Minuman</option>
                            <option value="Tambahan" ${product && product.category === 'Tambahan' ? 'selected' : ''}>Tambahan</option>
                            <option value="Lainnya" ${product && product.category === 'Lainnya' ? 'selected' : ''}>Lainnya</option>
                        </select>
                    </div>
                    <div class="flex gap-3 pt-2">
                        <button type="button" onclick="document.getElementById('modal-container').innerHTML = ''" class="flex-1 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Batal</button>
                        <button type="submit" class="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">Simpan</button>
                    </div>
                </form>
            </div>
        `;

        const container = document.getElementById('modal-container');
        container.innerHTML = '';
        container.appendChild(modal);

        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            App.saveProduct(data);
            container.innerHTML = '';
        });
    },

    renderTransaksi() {
        const container = document.getElementById('app-container');
        container.innerHTML = `
            <div class="h-[calc(100vh-140px)] flex flex-col">
                <div class="flex-none mb-4">
                    <h2 class="text-2xl font-bold mb-4">Transaksi Baru</h2>
                    <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2" id="category-filter">
                        <button class="px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium whitespace-nowrap shadow-md shadow-primary-500/20">Semua</button>
                        <button class="px-4 py-2 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap border border-gray-200 dark:border-slate-700">Makanan</button>
                        <button class="px-4 py-2 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap border border-gray-200 dark:border-slate-700">Minuman</button>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto pb-24 grid grid-cols-2 gap-3 content-start" id="pos-product-list">
                    <!-- POS Products -->
                </div>

                <!-- Cart Summary Floating Bar -->
                <div class="fixed bottom-20 left-4 right-4 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
                    <div class="bg-gray-900 dark:bg-slate-800 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center cursor-pointer" onclick="UI.showCartModal()">
                        <div class="flex items-center gap-3">
                            <div class="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center font-bold" id="cart-count">0</div>
                            <div class="flex flex-col">
                                <span class="text-xs text-gray-300">Total Bayar</span>
                                <span class="font-bold text-lg" id="cart-total">Rp 0</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 font-medium text-primary-400">
                            Lihat Pesanan
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>
        `;

        App.loadPosProducts();
    },

    renderPosProductItem(product) {
        const isOutOfStock = product.stock <= 0;
        return `
            <div onclick="${isOutOfStock ? '' : `App.addToCart('${product.id}')`}" class="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'active:scale-95 cursor-pointer'} transition-transform h-full flex flex-col justify-between relative overflow-hidden">
                ${isOutOfStock ? '<div class="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center font-bold text-red-600 -rotate-12">HABIS</div>' : ''}
                <div>
                    <h4 class="font-semibold text-sm line-clamp-2 dark:text-white">${product.name}</h4>
                    <p class="text-xs text-gray-500 mt-1">${product.category}</p>
                </div>
                <div class="mt-3 flex justify-between items-end">
                    <div>
                        <span class="text-primary-600 dark:text-primary-400 font-bold text-sm">Rp ${parseInt(product.price).toLocaleString('id-ID')}</span>
                        <p class="text-[10px] text-gray-400">Stok: ${product.stock}</p>
                    </div>
                    <div class="w-6 h-6 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    </div>
                </div>
            </div>
        `;
    },

    showCartModal() {
        const cart = App.cart;
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in';

        let cartItemsHtml = '';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            cartItemsHtml += `
                <div class="flex justify-between items-center py-3 border-b border-gray-100 dark:border-slate-700 last:border-0">
                    <div class="flex-1">
                        <h4 class="font-medium dark:text-white">${item.name}</h4>
                        <p class="text-sm text-gray-500">Rp ${item.price.toLocaleString('id-ID')} x ${item.qty}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <button onclick="App.updateCartQty('${item.id}', -1)" class="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300">-</button>
                        <span class="font-medium w-4 text-center dark:text-white">${item.qty}</span>
                        <button onclick="App.updateCartQty('${item.id}', 1)" class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">+</button>
                    </div>
                </div>
            `;
        });

        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl h-[80vh] sm:h-auto flex flex-col animate-slide-up">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold dark:text-white">Detail Pesanan</h3>
                    <button onclick="document.getElementById('modal-container').innerHTML = ''" class="p-2 text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div class="flex-1 overflow-y-auto -mx-2 px-2">
                    ${cart.length === 0 ? '<p class="text-center text-gray-500 py-10">Keranjang kosong</p>' : cartItemsHtml}
                </div>

                <div class="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-600 dark:text-gray-400">Total</span>
                        <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">Rp ${total.toLocaleString('id-ID')}</span>
                    </div>
                    <button onclick="App.processTransaction()" ${cart.length === 0 ? 'disabled' : ''} class="w-full py-3 bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-colors">
                        Bayar Sekarang
                    </button>
                </div>
            </div>
        `;

        const container = document.getElementById('modal-container');
        container.innerHTML = '';
        container.appendChild(modal);
    },

    renderLaporan() {
        const container = document.getElementById('app-container');
        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <h2 class="text-2xl font-bold">Laporan Transaksi</h2>
                
                <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 class="font-semibold mb-4 dark:text-white">Riwayat Transaksi</h3>
                    <div class="space-y-3" id="transaction-history">
                        <div class="text-center py-8 text-gray-500">Memuat data...</div>
                    </div>
                </div>
            </div>
        `;
        App.loadTransactions();
    },

    renderTransactionItem(trx) {
        const date = new Date(trx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        return `
            <div class="flex justify-between items-center py-3 border-b border-gray-50 dark:border-slate-700 last:border-0">
                <div>
                    <p class="font-medium dark:text-white">#${trx.id.substr(-6)}</p>
                    <p class="text-xs text-gray-500">${date}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold text-primary-600 dark:text-primary-400">Rp ${parseInt(trx.total).toLocaleString('id-ID')}</p>
                    <p class="text-xs text-gray-400">${trx.items.length} Item</p>
                </div>
            </div>
        `;
    }
};
