UI.Employees = {
    render(container) {
        container.innerHTML = `
            <div class="flex flex-col h-full">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 class="text-2xl font-bold dark:text-white">Manajemen Karyawan</h2>
                        <p class="text-gray-500 dark:text-gray-400">Kelola akses dan penugasan karyawan</p>
                    </div>
                    <button onclick="UI.Employees.showModal()" class="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-700 shadow-neon flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Tambah Karyawan
                    </button>
                </div>

                <div class="glass-panel rounded-2xl border border-white/20 overflow-hidden flex-1">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama</th>
                                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Outlet</th>
                                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/10" id="employee-list">
                                <!-- Employees Rendered Here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.loadEmployees();
    },

    loadEmployees() {
        const list = document.getElementById('employee-list');
        let users = DB.findAll(DB.USERS);
        const accessibleOutlets = Auth.getAccessibleOutlets();
        const accessibleOutletIds = accessibleOutlets.map(o => o.id);

        // Filter users: Only show users belonging to accessible outlets
        users = users.filter(u => accessibleOutletIds.includes(u.outlet_id));

        if (users.length === 0) {
            list.innerHTML = `
                <tr>
                    <td colspan="5" class="p-8 text-center">
                        <div class="flex flex-col items-center justify-center">
                            <div class="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-2xl">👥</div>
                            <h3 class="text-lg font-bold dark:text-white mb-2">Belum ada karyawan</h3>
                            <button onclick="UI.Employees.showModal()" class="text-primary-600 hover:text-primary-700 font-bold">Tambah Karyawan</button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        list.innerHTML = users.map(user => {
            const outlet = accessibleOutlets.find(o => o.id === user.outlet_id);
            return `
                <tr class="hover:bg-white/5 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold mr-3">
                                ${user.name.charAt(0).toUpperCase()}
                            </div>
                            <div class="text-sm font-bold text-gray-900 dark:text-white">${user.name}</div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${user.email}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}">
                            ${user.role.toUpperCase()}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${outlet ? outlet.name : '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="UI.Employees.showModal('${user.id}')" class="text-primary-600 hover:text-primary-900 dark:hover:text-primary-400 mr-3">Edit</button>
                        ${user.id !== Auth.currentUser.id ? `<button onclick="UI.Employees.delete('${user.id}')" class="text-red-600 hover:text-red-900">Hapus</button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    showModal(id = null) {
        const user = id ? DB.findById(DB.USERS, id) : null;
        const accessibleOutlets = Auth.getAccessibleOutlets();

        const modal = document.getElementById('modal-overlay');
        modal.classList.remove('hidden');

        modal.innerHTML = `
            <div class="glass-panel w-full max-w-md p-6 rounded-2xl shadow-2xl m-4 animate-slide-up">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold dark:text-white">${id ? 'Edit Karyawan' : 'Tambah Karyawan'}</h3>
                    <button onclick="document.getElementById('modal-overlay').classList.add('hidden')" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <form id="employee-form" class="space-y-4">
                    <input type="hidden" name="id" value="${id || ''}">
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Nama Lengkap</label>
                        <input type="text" name="name" value="${user ? user.name : ''}" required class="w-full rounded-xl input-neon dark:text-white px-4 py-3">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                        <input type="email" name="email" value="${user ? user.email : ''}" required class="w-full rounded-xl input-neon dark:text-white px-4 py-3">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Password ${id ? '<span class="text-xs text-gray-500">(Kosongkan jika tidak diubah)</span>' : ''}</label>
                        <div class="relative">
                            <input type="password" name="password" id="emp-password" ${id ? '' : 'required'} class="w-full rounded-xl input-neon dark:text-white px-4 py-3 pr-10">
                            <button type="button" onclick="const i=document.getElementById('emp-password'); i.type=i.type==='password'?'text':'password'" class="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            </button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Role</label>
                            <select name="role" class="w-full rounded-xl input-neon dark:text-white px-4 py-3 bg-transparent">
                                <option value="staff" ${user && user.role === 'staff' ? 'selected' : ''} class="text-gray-800">Staff</option>
                                <option value="admin" ${user && user.role === 'admin' ? 'selected' : ''} class="text-gray-800">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Outlet</label>
                            <select name="outlet_id" class="w-full rounded-xl input-neon dark:text-white px-4 py-3 bg-transparent">
                                ${accessibleOutlets.map(o => `<option value="${o.id}" ${user && user.outlet_id === o.id ? 'selected' : ''} class="text-gray-800">${o.name}</option>`).join('')}
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

        document.getElementById('employee-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            if (data.id) {
                if (!data.password) delete data.password;
                await Auth.updateUser(data.id, data);
            } else {
                delete data.id;
                const res = await Auth.register(data);
                if (!res.success) {
                    alert(res.message);
                    return;
                }
            }

            document.getElementById('modal-overlay').classList.add('hidden');
            this.loadEmployees();
        });
    },

    delete(id) {
        if (confirm('Apakah anda yakin ingin menghapus karyawan ini?')) {
            Auth.deleteUser(id);
            this.loadEmployees();
        }
    }
};
