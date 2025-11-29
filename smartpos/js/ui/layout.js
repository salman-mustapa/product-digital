UI.Layout = {
    init() {
        this.renderSkeleton();
        this.setupListeners();
        this.checkAuth();
    },

    checkAuth() {
        if (Auth.requireAuth()) {
            this.renderSidebar();
            this.renderHeader();
            UI.Dashboard.init(); // Default view
        }
    },

    renderSkeleton() {
        document.body.innerHTML = `
            <div id="app" class="flex h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
                <!-- Sidebar (Desktop) -->
                <aside id="sidebar" class="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all duration-300">
                    <!-- Sidebar Content -->
                </aside>
                
                <!-- Main Content -->
                <div class="flex-1 flex flex-col overflow-hidden">
                    <!-- Header -->
                    <header id="header" class="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 flex justify-between items-center px-4 z-20">
                        <!-- Header Content -->
                    </header>
                    
                    <!-- Content Scrollable -->
                    <main id="main-content" class="flex-1 overflow-y-auto p-4 relative">
                        <!-- Dynamic View Content -->
                    </main>
                    
                    <!-- Bottom Nav (Mobile) -->
                    <nav id="bottom-nav" class="md:hidden h-16 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex justify-around items-center z-20">
                        <!-- Nav Items -->
                    </nav>
                </div>
                
                <!-- Overlays -->
                <div id="modal-overlay" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4"></div>
                <div id="sync-loader" class="fixed inset-0 bg-black/70 z-[60] hidden flex flex-col items-center justify-center text-white">
                    <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p class="font-bold text-lg">Syncing Data...</p>
                    <p class="text-sm opacity-80">Please wait, do not close this window.</p>
                </div>
            </div>
        `;
    },

    renderHeader() {
        const header = document.getElementById('header');
        const user = Auth.currentUser;
        const outlet = DB.findById(DB.OUTLETS, user.outlet_id);

        header.innerHTML = `
            <div class="flex items-center gap-3">
                <button id="mobile-menu-btn" class="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <div>
                    <h1 class="font-bold text-lg leading-tight text-primary-600 dark:text-primary-400">UMKM POS</h1>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${outlet ? outlet.name : 'Setup Required'}</p>
                </div>
            </div>
            
            <div class="flex items-center gap-2">
                <!-- Sync Button -->
                <button onclick="Sync.syncData()" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 relative group">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span class="absolute top-full right-0 mt-1 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Sync Data</span>
                </button>
                
                <!-- Theme Toggle -->
                <button id="theme-toggle" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300">
                    <svg id="sun-icon" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    <svg id="moon-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 24.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                </button>
                
                <!-- User Profile -->
                <div class="ml-2 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm cursor-pointer" onclick="Auth.logout()" title="Logout">
                    ${user ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
            </div>
        `;

        this.setupThemeToggle();
    },

    renderSidebar() {
        const sidebar = document.getElementById('sidebar');
        const menuItems = [
            { id: 'dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { id: 'pos', label: 'Transaksi (POS)', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
            { id: 'products', label: 'Produk', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { id: 'categories', label: 'Kategori', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
            { id: 'reports', label: 'Laporan', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { id: 'settings', label: 'Pengaturan', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
        ];

        sidebar.innerHTML = `
            <div class="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-center">
                <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">P</div>
                <span class="ml-3 font-bold text-xl text-gray-800 dark:text-white">POS V2</span>
            </div>
            <nav class="flex-1 p-4 space-y-1">
                ${menuItems.map(item => `
                    <button onclick="UI.navigate('${item.id}')" class="sidebar-item w-full flex items-center px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors" data-target="${item.id}">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"></path></svg>
                        <span class="font-medium">${item.label}</span>
                    </button>
                `).join('')}
            </nav>
        `;

        // Render Bottom Nav (Mobile)
        const bottomNav = document.getElementById('bottom-nav');
        const mobileItems = menuItems.filter(i => ['dashboard', 'products', 'pos', 'reports', 'categories'].includes(i.id));

        bottomNav.innerHTML = mobileItems.map(item => `
            <button onclick="UI.navigate('${item.id}')" class="nav-btn flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors" data-target="${item.id}">
                <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"></path></svg>
                <span class="text-[10px] font-medium">${item.label}</span>
            </button>
        `).join('');
    },

    navigate(viewId) {
        // Update Active State
        document.querySelectorAll('.sidebar-item, .nav-btn').forEach(el => {
            if (el.dataset.target === viewId) {
                el.classList.add('text-primary-600', 'dark:text-primary-400', 'bg-primary-50', 'dark:bg-primary-900/20');
                el.classList.remove('text-gray-600', 'dark:text-gray-300', 'text-gray-400');
            } else {
                el.classList.remove('text-primary-600', 'dark:text-primary-400', 'bg-primary-50', 'dark:bg-primary-900/20');
                el.classList.add('text-gray-600', 'dark:text-gray-300');
                if (el.classList.contains('nav-btn')) el.classList.add('text-gray-400');
            }
        });

        // Load View
        const main = document.getElementById('main-content');
        main.innerHTML = ''; // Clear

        switch (viewId) {
            case 'dashboard': UI.Dashboard.render(main); break;
            case 'pos': UI.POS.render(main); break;
            case 'products': UI.Products.render(main); break;
            case 'categories': UI.Categories.render(main); break;
            case 'reports': UI.Reports.render(main); break;
            case 'settings': UI.Settings.render(main); break;
        }
    },

    setupThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');
        const html = document.documentElement;

        // Check saved theme
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

    showSyncLoader(show) {
        const loader = document.getElementById('sync-loader');
        if (show) loader.classList.remove('hidden');
        else loader.classList.add('hidden');
    },

    updateSyncStatus(status) {
        // Can implement a toast or update header icon
        console.log('Sync Status:', status);
    },

    showSetup() {
        document.body.innerHTML = ''; // Clear everything
        // Render Setup Form
        const div = document.createElement('div');
        div.className = 'min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4';
        div.innerHTML = `
            <div class="bg-white dark:bg-slate-800 w-full max-w-md p-8 rounded-2xl shadow-xl">
                <h2 class="text-2xl font-bold mb-2 text-center dark:text-white">Setup Toko</h2>
                <p class="text-center text-gray-500 mb-6">Buat akun admin dan toko pertama anda.</p>
                <form id="setup-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Nama Toko (Outlet)</label>
                        <input type="text" name="outlet_name" required class="w-full rounded-lg border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Nama Admin</label>
                        <input type="text" name="admin_name" required class="w-full rounded-lg border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                        <input type="email" name="email" required class="w-full rounded-lg border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
                        <input type="password" name="password" required class="w-full rounded-lg border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    </div>
                    <button type="submit" class="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">Mulai Sekarang</button>
                </form>
            </div>
        `;
        document.body.appendChild(div);

        document.getElementById('setup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            // Create Outlet
            const outlet = DB.insert(DB.OUTLETS, { name: data.outlet_name });

            // Create Admin
            const res = Auth.register({
                name: data.admin_name,
                email: data.email,
                password: data.password,
                outlet_id: outlet.id,
                role: 'admin'
            });

            if (res.success) {
                Auth.login(data.email, data.password);
                window.location.reload();
            } else {
                alert(res.message);
            }
        });
    },

    showLogin() {
        document.body.innerHTML = '';
        const div = document.createElement('div');
        div.className = 'min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4';
        div.innerHTML = `
            <div class="bg-white dark:bg-slate-800 w-full max-w-md p-8 rounded-2xl shadow-xl">
                <h2 class="text-2xl font-bold mb-2 text-center dark:text-white">Login</h2>
                <p class="text-center text-gray-500 mb-6">Masuk ke aplikasi POS.</p>
                <form id="login-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                        <input type="email" name="email" required class="w-full rounded-lg border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
                        <input type="password" name="password" required class="w-full rounded-lg border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    </div>
                    <button type="submit" class="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">Masuk</button>
                </form>
            </div>
        `;
        document.body.appendChild(div);

        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            const res = Auth.login(data.email, data.password);
            if (res.success) {
                window.location.reload();
            } else {
                alert(res.message);
            }
        });
    },

    setupListeners() {
        // Global listeners if any
    }
};
