UI.POS = {
    cart: [],

    render(container) {
        container.innerHTML = `
            <div class="flex flex-col md:flex-row h-full gap-4">
                <!-- Product Grid -->
                <div class="flex-1 flex flex-col h-full overflow-hidden">
                    <div class="glass-panel p-4 rounded-2xl mb-4 shadow-sm border border-white/20">
                        <div class="flex flex-col md:flex-row gap-2">
                            <div class="relative flex-1">
                                <input type="text" id="pos-search" placeholder="Cari produk..." class="w-full pl-10 pr-4 py-3 rounded-xl input-neon dark:text-white shadow-sm">
                                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <select id="pos-category" class="w-full md:w-48 rounded-xl input-neon dark:text-white px-4 py-3 bg-transparent">
                                <option value="" class="text-gray-800">Semua Kategori</option>
                                ${DB.findAll(DB.CATEGORIES).map(c => `<option value="${c.id}" class="text-gray-800">${c.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div id="pos-products" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-24 md:pb-0 pr-2">
                        <!-- Products Rendered Here -->
                    </div>
                </div>
                
                <!-- Cart Sidebar (Desktop) -->
                <div class="hidden md:flex flex-col w-96 glass-panel rounded-2xl shadow-sm border border-white/20 h-full overflow-hidden">
                    <div class="p-4 border-b border-white/10">
                        <h3 class="font-bold text-lg dark:text-white">Keranjang</h3>
                    </div>
                    <div id="pos-cart-items" class="flex-1 overflow-y-auto p-4 space-y-3">
                        <!-- Cart Items -->
                    </div>
                    <div class="p-4 border-t border-white/10 bg-white/5">
                        <div class="flex justify-between mb-4">
                            <span class="text-gray-600 dark:text-gray-300">Total</span>
                            <span class="text-2xl font-bold text-primary-600 dark:text-primary-400" id="pos-total">Rp 0</span>
                        </div>
                        <button onclick="UI.POS.checkout()" id="pos-checkout-btn" class="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-neon disabled:opacity-50 disabled:cursor-not-allowed">Bayar Sekarang</button>
                    </div>
                </div>
                
                <!-- Floating Cart (Mobile) -->
                <div id="mobile-cart-bar" class="md:hidden fixed bottom-24 left-4 right-4 glass-panel p-4 rounded-2xl shadow-neon border border-white/20 flex justify-between items-center z-30 cursor-pointer hidden" onclick="UI.POS.toggleMobileCart()">
                    <div class="flex items-center gap-3">
                        <div class="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold" id="mobile-cart-count">0</div>
                        <div class="flex flex-col">
                            <span class="text-xs text-gray-500 dark:text-gray-400">Total</span>
                            <span class="font-bold text-lg dark:text-white" id="mobile-cart-total">Rp 0</span>
                        </div>
                    </div>
                    <button class="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold shadow-neon">Lihat</button>
                </div>
            </div>
        `;

        this.loadProducts();

        document.getElementById('pos-search').addEventListener('input', () => this.loadProducts());
        document.getElementById('pos-category').addEventListener('change', () => this.loadProducts());
    },

    loadProducts() {
        const list = document.getElementById('pos-products');
        const search = document.getElementById('pos-search').value.toLowerCase();
        const category = document.getElementById('pos-category').value;

        let products = DB.findAll(DB.PRODUCTS);
        const accessibleOutlets = Auth.getAccessibleOutlets();
        const accessibleOutletIds = accessibleOutlets.map(o => o.id);

        // Filter products to only those in accessible outlets
        products = products.filter(p => accessibleOutletIds.includes(p.outlet_id));

        if (search) products = products.filter(p => p.name.toLowerCase().includes(search));
        if (category) products = products.filter(p => p.category_id === category);

        list.innerHTML = products.map(p => {
            const isOutOfStock = p.stock <= 0;
            const outlet = DB.findById(DB.OUTLETS, p.outlet_id);
            const outletName = outlet ? outlet.name : 'Unknown Outlet';

            const isAdmin = Auth.currentUser.role === 'admin';
            const isDisabled = isOutOfStock || isAdmin;

            return `
                <div onclick="${isDisabled ? '' : `UI.POS.addToCart('${p.id}')`}" class="glass-panel p-3 rounded-2xl shadow-sm border border-white/20 ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary-500'} transition-all h-full flex flex-col justify-between relative overflow-hidden group">
                    ${isOutOfStock ? '<div class="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center font-bold text-red-600 -rotate-12 z-10">HABIS</div>' : ''}
                    ${isAdmin && !isOutOfStock ? `<div class="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center font-bold text-gray-800 dark:text-white text-center p-2 z-10 text-xs">Hanya outlet<br>${outletName}</div>` : ''}
                    
                    <div class="aspect-square rounded-xl bg-gray-100 dark:bg-slate-700 mb-2 overflow-hidden">
                        ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">` : '<div class="w-full h-full flex items-center justify-center text-2xl">📦</div>'}
                    </div>
                    <div>
                        <h4 class="font-bold text-sm dark:text-white line-clamp-1">${p.name}</h4>
                        <p class="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            ${outletName}
                        </p>
                    </div>
                    <div class="mt-2 flex justify-between items-end">
                        <div>
                            <span class="text-primary-600 dark:text-primary-400 font-bold text-sm">Rp ${parseInt(p.price).toLocaleString('id-ID')}</span>
                            <p class="text-[10px] text-gray-400">Stok: ${p.stock}</p>
                        </div>
                        <div class="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    addToCart(id) {
        const product = DB.findById(DB.PRODUCTS, id);
        const existing = this.cart.find(i => i.id === id);
        const currentQty = existing ? existing.qty : 0;

        if (product.stock <= currentQty) {
            alert('Stok tidak mencukupi!');
            return;
        }

        if (existing) {
            existing.qty++;
        } else {
            this.cart.push({ ...product, qty: 1 });
        }
        this.updateCartUI();
    },

    updateCartUI() {
        const totalQty = this.cart.reduce((sum, i) => sum + i.qty, 0);
        const totalPrice = this.cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

        // Update Desktop Cart
        const cartItems = document.getElementById('pos-cart-items');
        if (cartItems) {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="flex gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/10 animate-fade-in">
                    <div class="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                        ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center">📦</div>'}
                    </div>
                    <div class="flex-1">
                        <h4 class="font-medium text-sm dark:text-white line-clamp-1">${item.name}</h4>
                        <p class="text-xs text-primary-600 dark:text-primary-400">Rp ${item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="UI.POS.updateQty('${item.id}', -1)" class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200">-</button>
                        <span class="text-sm font-bold w-4 text-center dark:text-white">${item.qty}</span>
                        <button onclick="UI.POS.updateQty('${item.id}', 1)" class="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200">+</button>
                    </div>
                </div>
            `).join('');

            if (this.cart.length === 0) {
                cartItems.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        <p>Keranjang Kosong</p>
                    </div>
                `;
            }
        }

        const totalEl = document.getElementById('pos-total');
        if (totalEl) totalEl.textContent = 'Rp ' + totalPrice.toLocaleString('id-ID');

        const checkoutBtn = document.getElementById('pos-checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.cart.length === 0;
            if (this.cart.length === 0) checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
            else checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }

        // Update Mobile Cart Bar
        const mobileCount = document.getElementById('mobile-cart-count');
        const mobileTotal = document.getElementById('mobile-cart-total');
        const mobileBar = document.getElementById('mobile-cart-bar');

        if (mobileCount) mobileCount.textContent = totalQty;
        if (mobileTotal) mobileTotal.textContent = 'Rp ' + totalPrice.toLocaleString('id-ID');

        if (mobileBar) {
            if (this.cart.length > 0) mobileBar.classList.remove('hidden');
            else mobileBar.classList.add('hidden');
        }
    },

    toggleMobileCart() {
        // Reuse the modal logic but customized for cart
        const modal = document.getElementById('modal-overlay');
        modal.classList.remove('hidden');

        const total = this.cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

        modal.innerHTML = `
            <div class="glass-panel w-full max-w-md p-6 rounded-2xl shadow-2xl m-4 flex flex-col h-[80vh] animate-slide-up">
                <div class="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                    <h3 class="font-bold text-lg dark:text-white">Keranjang Belanja</h3>
                    <button onclick="document.getElementById('modal-overlay').classList.add('hidden')" class="p-2 hover:bg-white/10 rounded-lg">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto space-y-3 pr-2">
                    ${this.cart.map(item => `
                        <div class="flex gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/10">
                            <div class="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                                ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center">📦</div>'}
                            </div>
                            <div class="flex-1">
                                <h4 class="font-medium text-sm dark:text-white line-clamp-1">${item.name}</h4>
                                <p class="text-xs text-primary-600 dark:text-primary-400">Rp ${item.price.toLocaleString('id-ID')}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <button onclick="UI.POS.updateQty('${item.id}', -1)" class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200">-</button>
                                <span class="text-sm font-bold w-4 text-center dark:text-white">${item.qty}</span>
                                <button onclick="UI.POS.updateQty('${item.id}', 1)" class="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200">+</button>
                            </div>
                        </div>
                    `).join('')}
                    ${this.cart.length === 0 ? '<p class="text-center text-gray-500 py-8">Keranjang kosong</p>' : ''}
                </div>
                <div class="pt-4 border-t border-white/10 mt-4">
                    <div class="flex justify-between mb-4">
                        <span class="text-gray-600 dark:text-gray-400">Total</span>
                        <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">Rp ${total.toLocaleString('id-ID')}</span>
                    </div>
                    <button onclick="UI.POS.checkout()" ${this.cart.length === 0 ? 'disabled' : ''} class="w-full py-3 bg-primary-600 disabled:bg-gray-300 text-white rounded-xl font-bold hover:bg-primary-700 shadow-neon">Bayar Sekarang</button>
                </div>
            </div>
        `;
    },

    updateQty(id, change) {
        const index = this.cart.findIndex(i => i.id === id);
        if (index === -1) return;

        const item = this.cart[index];
        const product = DB.findById(DB.PRODUCTS, id);

        if (change > 0 && item.qty >= product.stock) {
            alert('Stok tidak mencukupi!');
            return;
        }

        item.qty += change;
        if (item.qty <= 0) this.cart.splice(index, 1);

        this.updateCartUI();
        // If mobile modal is open, refresh it
        const modal = document.getElementById('modal-overlay');
        if (!modal.classList.contains('hidden') && modal.innerHTML.includes('Keranjang Belanja')) {
            this.toggleMobileCart();
        }
    },

    checkout() {
        const total = this.cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

        // 1. Deduct Stock
        this.cart.forEach(item => {
            const product = DB.findById(DB.PRODUCTS, item.id);
            DB.update(DB.PRODUCTS, item.id, { stock: product.stock - item.qty });
        });

        // 2. Save Transaction
        // OPTIMIZATION: Only save essential fields to save space and avoid QuotaExceededError
        const itemsToSave = this.cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty
        }));

        DB.insert(DB.TRANSACTIONS, {
            outlet_id: Auth.currentUser.outlet_id,
            items: itemsToSave,
            total: total,
            date: new Date().toISOString(),
            payment_method: 'cash',
            user_id: Auth.currentUser.id,
            user_name: Auth.currentUser.name,
            outlet_name: (DB.findById(DB.OUTLETS, Auth.currentUser.outlet_id) || {}).name || 'Unknown'
        });

        alert('Transaksi Berhasil!');
        this.cart = [];
        this.updateCartUI();
        document.getElementById('modal-overlay').classList.add('hidden');
        this.loadProducts(); // Refresh stock display
    }
};
