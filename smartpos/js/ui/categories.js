UI.Categories = {
    render(container) {
        container.innerHTML = `
            <div class="space-y-4 animate-fade-in">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Kategori</h2>
                    <button onclick="UI.Categories.showModal()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Tambah
                    </button>
                </div>
                
                <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400">
                            <tr>
                                <th class="p-4 font-medium">Nama Kategori</th>
                                <th class="p-4 font-medium">Jumlah Produk</th>
                                <th class="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-slate-700" id="category-list">
                            <!-- List -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        this.loadCategories();
    },

    loadCategories() {
        const list = document.getElementById('category-list');
        const categories = DB.findAll(DB.CATEGORIES);
        const products = DB.findAll(DB.PRODUCTS);

        list.innerHTML = categories.map(c => {
            const count = products.filter(p => p.category_id === c.id).length;
            return `
                <tr class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td class="p-4 font-medium dark:text-white">${c.name}</td>
                    <td class="p-4 text-gray-500">${count} Produk</td>
                    <td class="p-4 text-right">
                        <button onclick="UI.Categories.delete('${c.id}')" class="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    showModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('hidden');
        overlay.innerHTML = `
            <div class="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-up">
                <h3 class="text-xl font-bold mb-4 dark:text-white">Tambah Kategori</h3>
                <form id="category-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Nama Kategori</label>
                        <input type="text" name="name" required class="w-full rounded-lg border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    </div>
                    <div class="flex gap-3 pt-2">
                        <button type="button" onclick="document.getElementById('modal-overlay').classList.add('hidden')" class="flex-1 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium">Batal</button>
                        <button type="submit" class="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700">Simpan</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            DB.insert(DB.CATEGORIES, {
                ...data,
                outlet_id: Auth.currentUser.outlet_id
            });

            overlay.classList.add('hidden');
            this.loadCategories();
        });
    },

    delete(id) {
        if (confirm('Hapus kategori ini?')) {
            DB.remove(DB.CATEGORIES, id);
            this.loadCategories();
        }
    }
};
