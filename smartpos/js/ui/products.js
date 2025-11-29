UI.Products = {
    render(container) {
        container.innerHTML = `
            <div class="space-y-4 animate-fade-in">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Produk</h2>
                    <button onclick="UI.Products.showModal()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Tambah
                    </button>
                </div>
                
                <div class="relative">
                    <input type="text" id="search-product" placeholder="Cari produk..." class="w-full pl-10 pr-4 py-3 rounded-xl border-none bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-primary-500 dark:text-white">
                    <svg class="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                
                <div id="product-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                    <!-- List -->
                </div>
            </div>
        `;
        this.loadProducts();

        document.getElementById('search-product').addEventListener('input', (e) => {
            this.loadProducts(e.target.value);
        });
    },

    loadProducts(query = '') {
        const list = document.getElementById('product-list');
        let products = DB.findAll(DB.PRODUCTS);

        if (query) {
            products = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
        }

        list.innerHTML = products.map(p => `
            <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex gap-4">
                <div class="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                    ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : '<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>'}
                </div>
                <div class="flex-1">
                    <h3 class="font-bold dark:text-white line-clamp-1">${p.name}</h3>
                    <p class="text-primary-600 dark:text-primary-400 font-medium">Rp ${parseInt(p.price).toLocaleString('id-ID')}</p>
                    <p class="text-xs text-gray-500 mt-1">Stok: ${p.stock}</p>
                    <div class="flex gap-2 mt-2">
                        <button onclick="UI.Products.showModal('${p.id}')" class="text-blue-600 text-xs font-medium hover:underline">Edit</button>
                        <button onclick="UI.Products.delete('${p.id}')" class="text-red-600 text-xs font-medium hover:underline">Hapus</button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    showModal(id = null) {
        const product = id ? DB.findById(DB.PRODUCTS, id) : null;
        const categories = DB.findAll(DB.CATEGORIES);

        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('hidden');
        overlay.innerHTML = `
            <div class="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-slide-up">
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
                        <input type="text" name="name" required value="${product ? product.name : ''}" class="w-full rounded-lg border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Harga</label>
                            <input type="number" name="price" required value="${product ? product.price : ''}" class="w-full rounded-lg border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Stok</label>
                            <input type="number" name="stock" required value="${product ? product.stock : ''}" class="w-full rounded-lg border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Kategori</label>
                        <select name="category_id" class="w-full rounded-lg border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            ${categories.map(c => `<option value="${c.id}" ${product && product.category_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Deskripsi</label>
                        <textarea name="description" class="w-full rounded-lg border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white">${product ? product.description || '' : ''}</textarea>
                    </div>

                    <div class="flex gap-3 pt-2">
                        <button type="button" onclick="document.getElementById('modal-overlay').classList.add('hidden')" class="flex-1 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium">Batal</button>
                        <button type="submit" class="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700">Simpan</button>
                    </div>
                </form>
            </div>
        `;

        // Image Handler
        document.getElementById('image-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    document.getElementById('image-base64').value = reader.result;
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            DB.insert(DB.PRODUCTS, {
                ...data,
                price: Number(data.price),
                stock: Number(data.stock),
                outlet_id: Auth.currentUser.outlet_id
            });

            overlay.classList.add('hidden');
            this.loadProducts();
        });
    },

    delete(id) {
        if (confirm('Hapus produk ini?')) {
            DB.remove(DB.PRODUCTS, id);
            this.loadProducts();
        }
    }
};
