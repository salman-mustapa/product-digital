UI.Settings = {
    render(container) {
        const user = Auth.currentUser;
        const outlet = DB.findById(DB.OUTLETS, user.outlet_id);

        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <h2 class="text-2xl font-bold">Pengaturan</h2>
                
                <div class="glass-panel rounded-xl shadow-sm border border-white/20 p-6">
                    <h3 class="text-lg font-bold mb-4 dark:text-white">Profil Toko</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium mb-1 text-gray-500">Nama Toko</label>
                            <p class="font-medium text-lg dark:text-white">${outlet.name}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1 text-gray-500">ID Outlet</label>
                            <p class="font-mono text-sm bg-white/10 p-2 rounded inline-block dark:text-white">${outlet.id}</p>
                        </div>
                    </div>
                </div>
                
                <div class="glass-panel rounded-xl shadow-sm border border-white/20 p-6">
                    <h3 class="text-lg font-bold mb-4 dark:text-white">Akun Saya</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium mb-1 text-gray-500">Nama</label>
                            <p class="font-medium text-lg dark:text-white">${user.name}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1 text-gray-500">Email</label>
                            <p class="font-medium text-lg dark:text-white">${user.email}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1 text-gray-500">Role</label>
                            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">${user.role}</span>
                        </div>
                    </div>
                    <div class="mt-6">
                        <button onclick="Auth.logout()" class="text-red-600 font-medium hover:underline">Keluar dari Aplikasi</button>
                    </div>
                </div>
                
                <div class="glass-panel rounded-xl shadow-sm border border-white/20 p-6">
                    <h3 class="text-lg font-bold mb-4 dark:text-white">Manajemen Data</h3>
                    <p class="text-sm text-gray-500 mb-4">Sinkronisasi data manual ke server Google Sheets.</p>
                    <button onclick="Sync.syncData()" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold shadow-neon flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Sync Data Sekarang
                    </button>
                </div>

                ${user.role === 'admin' ? `
                <div class="glass-panel rounded-xl shadow-sm border border-white/20 p-6">
                    <h3 class="text-lg font-bold mb-4 dark:text-white">Konfigurasi Server</h3>
                    <form id="server-config-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1 dark:text-gray-300">AppScript URL</label>
                            <input type="url" name="appscript_url" required value="${API.APPSCRIPT_URL}" class="w-full rounded-lg input-neon dark:text-white py-3 px-4 text-sm font-mono">
                        </div>
                        <button type="submit" class="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                            Simpan Konfigurasi
                        </button>
                    </form>
                </div>
                ` : ''}
            </div>
        `;

        if (user.role === 'admin') {
            setTimeout(() => {
                document.getElementById('server-config-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const url = formData.get('appscript_url');

                    localStorage.setItem('appscript_url', url);
                    API.APPSCRIPT_URL = url;

                    alert('URL Server berhasil disimpan!');
                });
            }, 0);
        }
    }
};
