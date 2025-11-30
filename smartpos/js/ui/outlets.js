UI.Outlets = {
    render(container) {
        container.innerHTML = `
            <div class="flex flex-col h-full">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 class="text-2xl font-bold dark:text-white">Manajemen Outlet</h2>
                        <p class="text-gray-500 dark:text-gray-400">Kelola cabang toko anda</p>
                    </div>
                    <button onclick="UI.Outlets.showModal()" class="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-700 shadow-neon flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Tambah Outlet
                    </button>
                </div>

                <div class="glass-panel rounded-2xl border border-white/20 overflow-hidden flex-1">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Outlet</th>
                                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alamat</th>
                                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telepon</th>
                                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/10" id="outlet-list">
                                <!-- Outlets Rendered Here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.loadOutlets();
    },

    loadOutlets() {
        const list = document.getElementById('outlet-list');
        const outlets = Auth.getAccessibleOutlets();

        list.innerHTML = outlets.map(outlet => `
            <tr class="hover:bg-white/5 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-bold text-gray-900 dark:text-white">${outlet.name}</div>
                    <div class="text-xs text-gray-500">ID: ${outlet.id}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${outlet.address || '-'}
                    <div class="mt-1">
                        <span class="px-2 py-0.5 text-[10px] rounded-full ${outlet.type === 'main' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">
                            ${outlet.type === 'main' ? 'PUSAT' : 'CABANG'}
                        </span>
                        ${outlet.parent_id ? `<span class="text-xs ml-1">Induk: ${(DB.findById(DB.OUTLETS, outlet.parent_id) || {}).name}</span>` : ''}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${outlet.phone || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="UI.Outlets.showModal('${outlet.id}')" class="text-primary-600 hover:text-primary-900 dark:hover:text-primary-400 mr-3">Edit</button>
                    ${outlet.id !== Auth.currentUser.outlet_id ? `<button onclick="UI.Outlets.delete('${outlet.id}')" class="text-red-600 hover:text-red-900">Hapus</button>` : ''}
                </td>
            </tr>
        `).join('');
    },

    showModal(id = null) {
        const outlet = id ? DB.findById(DB.OUTLETS, id) : null;
        const modal = document.getElementById('modal-overlay');
        modal.classList.remove('hidden');

        modal.innerHTML = `
            <div class="glass-panel w-full max-w-md p-6 rounded-2xl shadow-2xl m-4 animate-slide-up">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold dark:text-white">${id ? 'Edit Outlet' : 'Tambah Outlet'}</h3>
                    <button onclick="document.getElementById('modal-overlay').classList.add('hidden')" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <form id="outlet-form" class="space-y-4">
                    <input type="hidden" name="id" value="${id || ''}">
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Nama Outlet</label>
                        <input type="text" name="name" value="${outlet ? outlet.name : ''}" required class="w-full rounded-xl input-neon dark:text-white px-4 py-3">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Alamat</label>
                        <textarea name="address" class="w-full rounded-xl input-neon dark:text-white px-4 py-3" rows="3">${outlet ? outlet.address || '' : ''}</textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Telepon</label>
                        <input type="tel" name="phone" value="${outlet ? outlet.phone || '' : ''}" class="w-full rounded-xl input-neon dark:text-white px-4 py-3">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Tipe Outlet</label>
                            <select name="type" id="outlet-type" onchange="document.getElementById('parent-outlet-container').style.display = this.value === 'branch' ? 'block' : 'none'" class="w-full rounded-xl input-neon dark:text-white px-4 py-3 bg-transparent">
                                <option value="main" ${outlet && outlet.type === 'main' ? 'selected' : ''} class="text-gray-800">Pusat (Induk)</option>
                                <option value="branch" ${outlet && outlet.type === 'branch' ? 'selected' : ''} class="text-gray-800">Cabang</option>
                            </select>
                        </div>
                        <div id="parent-outlet-container" style="display: ${outlet && outlet.type === 'branch' ? 'block' : 'none'}">
                            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Induk Outlet</label>
                            <select name="parent_id" class="w-full rounded-xl input-neon dark:text-white px-4 py-3 bg-transparent">
                                <option value="" class="text-gray-800">Pilih Induk</option>
                                ${DB.findAll(DB.OUTLETS).filter(o => o.type === 'main' && o.id !== id).map(o => `<option value="${o.id}" ${outlet && outlet.parent_id === o.id ? 'selected' : ''} class="text-gray-800">${o.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="pt-4 flex gap-3">
                        <button type="button" onclick="document.getElementById('modal-overlay').classList.add('hidden')" class="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">Batal</button>
                        <button type="submit" class="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-neon transition-colors">Simpan</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('outlet-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            if (data.id) {
                DB.update(DB.OUTLETS, data.id, data);
            } else {
                delete data.id;
                DB.insert(DB.OUTLETS, data);
            }

            document.getElementById('modal-overlay').classList.add('hidden');
            this.loadOutlets();
        });
    },

    delete(id) {
        if (confirm('Apakah anda yakin ingin menghapus outlet ini?')) {
            DB.remove(DB.OUTLETS, id);
            this.loadOutlets();
        }
    }
};
