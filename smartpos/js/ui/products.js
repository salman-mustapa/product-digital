UI.Products = {
    render(container) {
        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold dark:text-white">Produk</h2>
                    <button onclick="UI.Products.showModal()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-bold shadow-neon flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Tambah
                    </button>
                </div>
                
                <div class="flex gap-4">
                    ${Auth.currentUser.role === 'admin' ? `
                    <div class="w-48">
                        <select id="filter-outlet" class="w-full py-3 px-4 rounded-xl input-neon dark:text-white bg-transparent">
                            <option value="">Semua Outlet</option>
                            ${Auth.getAccessibleOutlets().map(o => `<option value="${o.id}">${o.name}</option>`).join('')}
                        </select>
                    </div>
                    ` : ''}
                    <div class="relative flex-1">
                        <input type="text" id="search-product" placeholder="Cari produk..." class="w-full pl-10 pr-4 py-3 rounded-xl input-neon dark:text-white shadow-sm">
                        <svg class="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="product-list">
                    <!-- Products rendered here -->
                </div>
            </div>
        `;
        this.loadProducts();

        document.getElementById('search-product').addEventListener('input', (e) => {
            this.loadProducts(e.target.value, document.getElementById('filter-outlet')?.value);
        });

        if (document.getElementById('filter-outlet')) {
            document.getElementById('filter-outlet').addEventListener('change', (e) => {
                this.loadProducts(document.getElementById('search-product').value, e.target.value);
            });
        }
    },

    loadProducts(query = '', outletId = '') {
        const list = document.getElementById('product-list');
        let products = DB.findAll(DB.PRODUCTS);
        const accessibleOutlets = Auth.getAccessibleOutlets();
        const accessibleOutletIds = accessibleOutlets.map(o => o.id);

        // Filter products to only those in accessible outlets
        products = products.filter(p => accessibleOutletIds.includes(p.outlet_id));

        // Further filter if specific outlet selected (and allowed)
        if (outletId && accessibleOutletIds.includes(outletId)) {
            products = products.filter(p => p.outlet_id === outletId);
        }

        if (query) {
            products = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
        }

        if (products.length === 0) {
            list.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div class="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-4xl">📦</div>
                    <h3 class="text-xl font-bold dark:text-white mb-2">Belum ada produk</h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md">Tambahkan produk pertama anda untuk mulai berjualan.</p>
                    <button onclick="UI.Products.showModal()" class="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-neon hover:bg-primary-700 transition-colors">
                        Tambah Produk Baru
                    </button>
                </div>
            `;
            return;
        }

        list.innerHTML = products.map(p => `
            <div class="glass-panel rounded-2xl p-4 shadow-sm border border-white/20 flex flex-col h-full group hover:scale-[1.02] transition-transform duration-300">
                <div class="aspect-square rounded-xl bg-gray-100 dark:bg-slate-700 mb-4 overflow-hidden relative">
                    ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center text-4xl">📦</div>'}
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onclick="UI.Products.edit('${p.id}')" class="p-2 bg-white rounded-lg text-gray-800 hover:bg-gray-100"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                        <button onclick="UI.Products.delete('${p.id}')" class="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                </div>
                <h3 class="font-bold text-lg mb-1 dark:text-white line-clamp-1">${p.name}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">${p.description || 'Tidak ada deskripsi'}</p>
                <div class="mt-auto flex justify-between items-center">
                    <span class="font-bold text-primary-600 dark:text-primary-400">Rp ${p.price.toLocaleString('id-ID')}</span>
                    <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg dark:text-gray-300">Stok: ${p.stock}</span>
                </div>
                ${Auth.currentUser.role === 'admin' ? `
                <button onclick="UI.Products.transferStock('${p.id}')" class="mt-3 w-full py-2 bg-primary-100 text-primary-700 rounded-xl text-sm font-bold hover:bg-primary-200 transition-colors">
                    Transfer Stok
                </button>
                ` : ''}
            </div>
        `).join('');
    },

    showModal(id = null) {
        this.edit(id);
    },

    edit(id = null) {
        const product = id ? DB.findById(DB.PRODUCTS, id) : null;
        const categories = DB.findAll(DB.CATEGORIES);

        const modal = document.getElementById('modal-overlay');
        modal.classList.remove('hidden');
        modal.innerHTML = `
            <div class="glass-panel w-full max-w-lg p-6 rounded-2xl shadow-2xl m-4 animate-scale-in">
                <h3 class="text-xl font-bold mb-4 dark:text-white">${product ? 'Edit Produk' : 'Tambah Produk'}</h3>
                <form id="product-form" class="space-y-4">
                    <input type="hidden" name="id" value="${product ? product.id : ''}">
                    
                    <!-- Image Input -->
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Gambar</label>
                        <input type="file" id="image-input" accept="image/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100">
                        <input type="hidden" name="image" id="image-base64" value="${product ? product.image || '' : ''}">
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Nama Produk</label>
                        <input type="text" name="name" required value="${product ? product.name : ''}" class="w-full rounded-lg input-neon dark:text-white py-3 px-4">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Harga</label>
                            <input type="number" name="price" required value="${product ? product.price : ''}" class="w-full rounded-lg input-neon dark:text-white py-3 px-4">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Stok</label>
                            <input type="number" name="stock" required value="${product ? product.stock : ''}" class="w-full rounded-lg input-neon dark:text-white py-3 px-4">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Kategori</label>
                        <select name="category_id" class="w-full rounded-lg input-neon dark:text-white py-3 px-4 bg-transparent">
                            ${categories.map(c => `<option value="${c.id}" ${product && product.category_id === c.id ? 'selected' : ''} class="text-gray-800">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Deskripsi</label>
                        <textarea name="description" class="w-full rounded-lg input-neon dark:text-white py-3 px-4 bg-transparent">${product ? product.description || '' : ''}</textarea>
                    </div>

                    <div class="flex gap-3 pt-2">
                        <button type="button" onclick="document.getElementById('modal-overlay').classList.add('hidden')" class="flex-1 py-3 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium">Batal</button>
                        <button type="submit" class="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-neon">Simpan</button>
                    </div>
                </form>
            </div>
        `;

        // Image Handler with Compression
        document.getElementById('image-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        // Max dimension 800px
                        const MAX_SIZE = 800;
                        if (width > height) {
                            if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                            }
                        } else {
                            if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        // Compress to JPEG 0.7
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        document.getElementById('image-base64').value = dataUrl;
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            const productData = {
                ...data,
                price: Number(data.price),
                stock: Number(data.stock),
                outlet_id: Auth.currentUser.outlet_id
            };

            if (data.id) {
                DB.update(DB.PRODUCTS, data.id, productData);
            } else {
                delete productData.id;
                DB.insert(DB.PRODUCTS, productData);
            }

            modal.classList.add('hidden');
            this.loadProducts();
        });
    },

    transferStock(id) {
        const product = DB.findById(DB.PRODUCTS, id);
        const accessibleOutlets = Auth.getAccessibleOutlets();
        const outlets = accessibleOutlets.filter(o => o.id !== Auth.currentUser.outlet_id);

        if (outlets.length === 0) {
            alert('Tidak ada outlet lain untuk tujuan transfer.');
            return;
        }

        const modal = document.getElementById('modal-overlay');
        modal.classList.remove('hidden');
        modal.innerHTML = `
            <div class="glass-panel w-full max-w-md p-6 rounded-2xl shadow-2xl m-4 animate-scale-in">
                <h3 class="text-xl font-bold mb-4 dark:text-white">Transfer Stok</h3>
                <p class="text-sm text-gray-500 mb-4">Transfer stok <strong>${product.name}</strong> ke outlet lain.</p>
                
                <form id="transfer-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Outlet Tujuan</label>
                        <select name="to_outlet_id" required class="w-full rounded-lg input-neon dark:text-white py-3 px-4 bg-transparent">
                            ${outlets.map(o => `<option value="${o.id}" class="text-gray-800">${o.name}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Jumlah Transfer (Maks: ${product.stock})</label>
                        <input type="number" name="qty" required min="1" max="${product.stock}" class="w-full rounded-lg input-neon dark:text-white py-3 px-4">
                    </div>
                    
                    <div class="flex gap-3 pt-2">
                        <button type="button" onclick="document.getElementById('modal-overlay').classList.add('hidden')" class="flex-1 py-3 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium">Batal</button>
                        <button type="submit" class="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-neon">Transfer</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('transfer-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            const qty = Number(data.qty);
            const toOutletId = data.to_outlet_id;

            if (qty > product.stock) {
                alert('Stok tidak mencukupi!');
                return;
            }

            // 1. Deduct from source
            DB.update(DB.PRODUCTS, product.id, { stock: product.stock - qty });

            // 2. Add to destination
            const allProducts = DB.findAll(DB.PRODUCTS);

            // Find product in destination outlet with same name
            const targetProduct = allProducts.find(p =>
                p.outlet_id === toOutletId &&
                p.name.toLowerCase() === product.name.toLowerCase() &&
                !p.deleted
            );

            if (targetProduct) {
                // Update existing product in destination
                DB.update(DB.PRODUCTS, targetProduct.id, { stock: targetProduct.stock + qty });
            } else {
                // Create new product in destination
                const newProduct = {
                    ...product,
                    id: DB.generateId(DB.PRODUCTS),
                    outlet_id: toOutletId,
                    stock: qty,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                DB.insert(DB.PRODUCTS, newProduct);
            }

            modal.classList.add('hidden');
            this.loadProducts();
            alert('Transfer Berhasil!');
        });
    },

    delete(id) {
        if (confirm('Hapus produk ini?')) {
            DB.remove(DB.PRODUCTS, id);
            this.loadProducts();
        }
    }
};
