UI.POS = {
    cart: [],

    render(container) {
        container.innerHTML = `
            <div class="h-[calc(100vh-140px)] flex flex-col">
                <div class="flex-none mb-4 space-y-4">
                    <h2 class="text-2xl font-bold">Transaksi</h2>
                    
                    <div class="flex gap-2">
                        <div class="relative flex-1">
                            <input type="text" id="pos-search" placeholder="Cari produk..." class="w-full pl-10 pr-4 py-2 rounded-xl border-none bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-primary-500 dark:text-white">
                            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <select id="pos-category" class="rounded-xl border-none bg-white dark:bg-slate-800 shadow-sm dark:text-white px-4">
                            <option value="">Semua Kategori</option>
                            ${DB.findAll(DB.CATEGORIES).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto pb-24 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start" id="pos-list">
                    <!-- List -->
                </div>
                
                <!-- Cart Bar -->
                <div class="fixed bottom-20 left-4 right-4 md:left-64 md:right-8 max-w-4xl mx-auto">
                    <div class="bg-gray-900 dark:bg-slate-800 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center cursor-pointer" onclick="UI.POS.showCart()">
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

        this.loadProducts();

        document.getElementById('pos-search').addEventListener('input', () => this.loadProducts());
        document.getElementById('pos-category').addEventListener('change', () => this.loadProducts());
    },

    loadProducts() {
        const list = document.getElementById('pos-list');
        const search = document.getElementById('pos-search').value.toLowerCase();
        const category = document.getElementById('pos-category').value;

        let products = DB.findAll(DB.PRODUCTS);

        if (search) products = products.filter(p => p.name.toLowerCase().includes(search));
        if (category) products = products.filter(p => p.category_id === category);

        list.innerHTML = products.map(p => {
            const isOutOfStock = p.stock <= 0;
            return `
                <div onclick="${isOutOfStock ? '' : `UI.POS.addToCart('${p.id}')`}" class="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'active:scale-95 cursor-pointer'} transition-transform h-full flex flex-col justify-between relative overflow-hidden">
                    ${isOutOfStock ? '<div class="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center font-bold text-red-600 -rotate-12">HABIS</div>' : ''}
                    <div>
                        <h4 class="font-semibold text-sm line-clamp-2 dark:text-white">${p.name}</h4>
                    </div>
                    <div class="mt-3 flex justify-between items-end">
                        <div>
                            <span class="text-primary-600 dark:text-primary-400 font-bold text-sm">Rp ${parseInt(p.price).toLocaleString('id-ID')}</span>
                            <p class="text-[10px] text-gray-400">Stok: ${p.stock}</p>
                        </div>
                        <div class="w-6 h-6 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
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

        document.getElementById('cart-count').textContent = totalQty;
        document.getElementById('cart-total').textContent = 'Rp ' + totalPrice.toLocaleString('id-ID');
    },

    showCart() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('hidden');

        const total = this.cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

        overlay.innerHTML = `
            <div class="bg-white dark:bg-slate-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl h-[80vh] sm:h-auto flex flex-col animate-slide-up">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold dark:text-white">Detail Pesanan</h3>
                    <button onclick="document.getElementById('modal-overlay').classList.add('hidden')" class="p-2 text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div class="flex-1 overflow-y-auto -mx-2 px-2 space-y-3">
                    ${this.cart.map(item => `
                        <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                            <div class="flex-1">
                                <h4 class="font-medium dark:text-white">${item.name}</h4>
                                <p class="text-sm text-gray-500">Rp ${item.price.toLocaleString('id-ID')} x ${item.qty}</p>
                            </div>
                            <div class="flex items-center gap-3">
                                <button onclick="UI.POS.updateQty('${item.id}', -1)" class="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300">-</button>
                                <span class="font-medium w-4 text-center dark:text-white">${item.qty}</span>
                                <button onclick="UI.POS.updateQty('${item.id}', 1)" class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">+</button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-600 dark:text-gray-400">Total</span>
                        <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">Rp ${total.toLocaleString('id-ID')}</span>
                    </div>
                    <button onclick="UI.POS.checkout()" ${this.cart.length === 0 ? 'disabled' : ''} class="w-full py-3 bg-primary-600 disabled:bg-gray-300 text-white rounded-xl font-bold hover:bg-primary-700">Bayar Sekarang</button>
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
        this.showCart(); // Refresh modal
    },

    checkout() {
        const total = this.cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

        // 1. Deduct Stock
        this.cart.forEach(item => {
            const product = DB.findById(DB.PRODUCTS, item.id);
            DB.update(DB.PRODUCTS, item.id, { stock: product.stock - item.qty });
        });

        // 2. Save Transaction
        DB.insert(DB.TRANSACTIONS, {
            outlet_id: Auth.currentUser.outlet_id,
            items: this.cart,
            total: total,
            date: new Date().toISOString(),
            payment_method: 'cash'
        });

        alert('Transaksi Berhasil!');
        this.cart = [];
        this.updateCartUI();
        document.getElementById('modal-overlay').classList.add('hidden');
        this.loadProducts(); // Refresh stock display
    }
};
