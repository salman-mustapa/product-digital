UI.Layout = {
    themes: {
        green: {
            50: '240 253 244', 100: '220 252 231', 200: '187 247 208', 300: '134 239 172', 400: '74 222 128',
            500: '34 197 94', 600: '22 163 74', 700: '21 128 61', 800: '22 101 52', 900: '20 83 45'
        },
        blue: {
            50: '239 246 255', 100: '219 234 254', 200: '191 219 254', 300: '147 197 253', 400: '96 165 250',
            500: '59 130 246', 600: '37 99 235', 700: '29 78 216', 800: '30 64 175', 900: '30 58 138'
        },
        purple: {
            50: '250 245 255', 100: '243 232 255', 200: '233 213 255', 300: '216 180 254', 400: '192 132 252',
            500: '168 85 247', 600: '147 51 234', 700: '126 34 206', 800: '107 33 168', 900: '88 28 135'
        },
        red: {
            50: '254 242 242', 100: '254 226 226', 200: '254 202 202', 300: '252 165 165', 400: '248 113 113',
            500: '239 68 68', 600: '220 38 38', 700: '185 28 28', 800: '153 27 27', 900: '127 29 29'
        },
        orange: {
            50: '255 247 237', 100: '255 237 213', 200: '254 215 170', 300: '253 186 116', 400: '251 146 60',
            500: '249 115 22', 600: '234 88 12', 700: '194 65 12', 800: '154 52 18', 900: '124 45 18'
        }
    },

    installPrompt: null,

    async init() {
        this.renderSkeleton();
        this.setupListeners();

        // PWA Install Prompt Listener
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPrompt = e;
            this.updateInstallButton();
        });

        // Network Status Listeners
        window.addEventListener('online', () => this.updateOnlineStatus(true));
        window.addEventListener('offline', () => this.updateOnlineStatus(false));

        // Optimization: Check if we have data locally
        const users = DB.findAll(DB.USERS);
        const hasUrl = localStorage.getItem('appscript_url');

        if (users.length > 0 && hasUrl) {
            // We have data, proceed immediately
            API.APPSCRIPT_URL = hasUrl; // Ensure URL is set
            console.log('Local data found. Skipping initial blocking sync.');

            // Trigger background sync
            if (navigator.onLine) {
                API.init().then(() => console.log('Background sync started'));
            }

            this.checkAuth();
        } else {
            // No data, we must wait for API init (which might sync)
            console.log('No local data. Waiting for API init...');
            await API.init();
            this.checkAuth();
        }

        this.loadThemeColor();
        this.updateOnlineStatus(navigator.onLine);
    },

    checkAuth() {
        if (Auth.requireAuth()) {
            this.renderSidebar();
            this.renderHeader();
            UI.Dashboard.init(); // Default view
        }
    },

    loadThemeColor() {
        const color = localStorage.getItem('theme_color') || 'green';
        this.setThemeColor(color);
    },

    setThemeColor(colorName) {
        const theme = this.themes[colorName];
        if (!theme) return;

        const root = document.documentElement;
        Object.keys(theme).forEach(shade => {
            root.style.setProperty(`--color-primary-${shade}`, theme[shade]);
        });

        localStorage.setItem('theme_color', colorName);

        // Update active state in picker if visible
        document.querySelectorAll('.color-btn').forEach(btn => {
            if (btn.dataset.color === colorName) {
                btn.classList.add('ring-2', 'ring-offset-2', 'ring-gray-400');
            } else {
                btn.classList.remove('ring-2', 'ring-offset-2', 'ring-gray-400');
            }
        });
    },

    renderSkeleton() {
        document.body.innerHTML = `
            <div id="app" class="flex h-screen overflow-hidden">
                <!-- Sidebar (Desktop) -->
                <aside id="sidebar" class="hidden md:flex flex-col w-64 glass-panel border-r-0 m-4 rounded-2xl transition-all duration-300 z-30">
                    <!-- Sidebar Content -->
                </aside>
                
                <!-- Main Content -->
                <div class="flex-1 flex flex-col overflow-hidden relative">
                    <!-- Header -->
                    <header id="header" class="h-16 glass-panel border-b-0 mx-4 mt-4 mb-0 rounded-2xl flex justify-between items-center px-4 z-20">
                        <!-- Header Content -->
                    </header>
                    
                    <!-- Content Scrollable -->
                    <main id="main-content" class="flex-1 overflow-y-auto p-4 relative z-10">
                        <!-- Dynamic View Content -->
                    </main>
                    
                    <!-- Bottom Nav (Mobile) -->
                    <nav id="bottom-nav" class="md:hidden h-16 glass-panel border-t-0 m-4 rounded-2xl flex justify-around items-center z-20">
                        <!-- Nav Items -->
                    </nav>
                </div>
                
                <!-- Overlays -->
                <div id="modal-overlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4"></div>
                <div id="sync-loader" class="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] hidden flex flex-col items-center justify-center text-white">
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
                <button id="mobile-menu-btn" class="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/10" onclick="UI.Layout.toggleSidebar()">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <div>
                    <h1 class="font-bold text-lg leading-tight text-primary-600 dark:text-primary-400">UMKM POS</h1>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${outlet ? outlet.name : 'Setup Required'}</p>
                </div>
            </div>
            
            <div class="flex items-center gap-2">
                <!-- Install App Button (Hidden by default) -->
                <button id="install-btn" onclick="UI.Layout.installApp()" class="hidden p-2 rounded-full hover:bg-white/10 text-primary-600 dark:text-primary-400" title="Install App">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </button>

                <!-- Online Status -->
                <div id="network-status" class="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">
                    <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span class="hidden sm:inline">Online</span>
                </div>

                <!-- Sync Button -->
                <button id="sync-btn" onclick="Sync.syncData()" class="p-2 rounded-full hover:bg-white/10 text-gray-600 dark:text-gray-300 relative group">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span class="absolute top-full right-0 mt-1 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Sync Data</span>
                </button>
                
                <!-- Theme Toggle -->
                <button id="theme-toggle" class="p-2 rounded-full hover:bg-white/10 text-gray-600 dark:text-gray-300">
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
        this.updateInstallButton();
        this.updateOnlineStatus(navigator.onLine);
    },

    renderSidebar() {
        const sidebar = document.getElementById('sidebar');
        const menuItems = [
            { id: 'dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { id: 'pos', label: 'Transaksi (POS)', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
            { id: 'products', label: 'Produk', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { id: 'categories', label: 'Kategori', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
            { id: 'outlets', label: 'Outlet', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
            { id: 'employees', label: 'Karyawan', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { id: 'reports', label: 'Laporan', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { id: 'settings', label: 'Pengaturan', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
        ];

        // Filter menu based on role
        const user = Auth.currentUser;
        const visibleItems = menuItems.filter(item => {
            if (user.role === 'admin') return true;
            // Staff restrictions
            if (['outlets', 'employees'].includes(item.id)) return false;
            return true;
        });

        sidebar.innerHTML = `
            <div class="p-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-center">
                <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-neon">P</div>
                <span class="ml-3 font-bold text-xl text-gray-800 dark:text-white">POS V2</span>
            </div>
            <nav class="flex-1 p-4 space-y-1">
                ${visibleItems.map(item => `
                    <button onclick="UI.navigate('${item.id}')" class="sidebar-item w-full flex items-center px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/5 transition-colors" data-target="${item.id}">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"></path></svg>
                        <span class="font-medium">${item.label}</span>
                    </button>
                `).join('')}
            </nav>
            
            <!-- Color Picker -->
            <div class="p-4 border-t border-gray-200/50 dark:border-slate-700/50">
                <p class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Tema Warna</p>
                <div class="flex gap-2 justify-center">
                    <button onclick="UI.Layout.setThemeColor('green')" data-color="green" class="color-btn w-6 h-6 rounded-full bg-green-500 hover:scale-110 transition-transform"></button>
                    <button onclick="UI.Layout.setThemeColor('blue')" data-color="blue" class="color-btn w-6 h-6 rounded-full bg-blue-500 hover:scale-110 transition-transform"></button>
                    <button onclick="UI.Layout.setThemeColor('purple')" data-color="purple" class="color-btn w-6 h-6 rounded-full bg-purple-500 hover:scale-110 transition-transform"></button>
                    <button onclick="UI.Layout.setThemeColor('red')" data-color="red" class="color-btn w-6 h-6 rounded-full bg-red-500 hover:scale-110 transition-transform"></button>
                    <button onclick="UI.Layout.setThemeColor('orange')" data-color="orange" class="color-btn w-6 h-6 rounded-full bg-orange-500 hover:scale-110 transition-transform"></button>
                </div>
            </div>
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

        // Set initial active state for color picker
        const currentColor = localStorage.getItem('theme_color') || 'green';
        this.setThemeColor(currentColor);
    },

    navigate(viewId) {
        // Update Active State
        document.querySelectorAll('.sidebar-item, .nav-btn').forEach(el => {
            if (el.dataset.target === viewId) {
                el.classList.add('text-primary-600', 'dark:text-primary-400', 'bg-primary-50/50', 'dark:bg-primary-900/40');
                el.classList.remove('text-gray-600', 'dark:text-gray-300', 'text-gray-400');
            } else {
                el.classList.remove('text-primary-600', 'dark:text-primary-400', 'bg-primary-50/50', 'dark:bg-primary-900/40');
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
            case 'outlets': UI.Outlets.render(main); break;
            case 'employees': UI.Employees.render(main); break;
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
        let loader = document.getElementById('sync-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'sync-loader';
            loader.className = 'fixed inset-0 bg-black/70 backdrop-blur-md z-[60] hidden flex flex-col items-center justify-center text-white';
            loader.innerHTML = `
                <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="font-bold text-lg">Syncing Data...</p>
                <p class="text-sm opacity-80">Please wait, do not close this window.</p>
            `;
            document.body.appendChild(loader);
        }

        if (show) loader.classList.remove('hidden');
        else loader.classList.add('hidden');
    },

    updateSyncStatus(status) {
        console.log('Sync Status:', status);
        // Optional: Update UI icon or show toast
    },

    showSetup() {
        document.body.innerHTML = ''; // Clear everything

        // 1. Initial View: Connection Check
        const div = document.createElement('div');
        div.className = 'min-h-screen flex items-center justify-center p-4 relative';

        // Check if we already have a URL
        const currentUrl = localStorage.getItem('appscript_url') || API.APPSCRIPT_URL;
        const users = DB.findAll(DB.USERS);

        // Auto-redirect logic: If URL exists and we have users, go to Login.
        // If URL exists but no users, we might need to sync first (which API.init already tried).
        // If still no users, show Setup Form.

        if (currentUrl && users.length > 0) {
            this.showLogin();
            return;
        } else if (currentUrl && users.length === 0) {
            // URL exists but no data. Maybe sync failed or DB is empty.
            // Let's show the connection form but pre-filled, or maybe just the Setup Form?
            // Safest is to show Connection Form to allow re-check, but maybe auto-trigger check?
            // Let's just show the Setup Form (Create New Store) but with a "Check Connection" option?
            // Actually, if URL is there, we assume connection is good. If no users, it's a new store.
            document.body.appendChild(div);
            this.renderSetupForm(div);
            return;
        }

        div.innerHTML = `
            <div class="glass-panel w-full max-w-md p-8 rounded-2xl shadow-neon z-10" id="setup-container">
                <h2 class="text-2xl font-bold mb-2 text-center dark:text-white">Koneksi Server</h2>
                <p class="text-center text-gray-500 mb-6">Masukkan URL AppScript untuk menghubungkan aplikasi.</p>
                
                <form id="connection-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">AppScript URL</label>
                        <input type="url" name="appscript_url" required value="${currentUrl}" class="w-full rounded-lg input-neon dark:text-white py-3 px-4 text-sm">
                    </div>
                    <button type="submit" id="check-btn" class="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-neon flex justify-center items-center gap-2">
                        <span>Cek Koneksi</span>
                    </button>
                </form>
            </div>
        `;
        document.body.appendChild(div);

        document.getElementById('connection-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('check-btn');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Memeriksa...`;

            const formData = new FormData(e.target);
            const url = formData.get('appscript_url');

            try {
                const result = await API.checkConnection(url);

                if (result.success) {
                    // Save URL
                    localStorage.setItem('appscript_url', url);
                    API.APPSCRIPT_URL = url;

                    // Save Users and Outlets from connection check result if available
                    if (result.data && Array.isArray(result.data)) {
                        DB.save(DB.USERS, result.data);
                    }

                    // Sync to get latest data (including products, outlets, etc)
                    await API.sync();

                    // Check Data Presence
                    const users = DB.findAll(DB.USERS);

                    if (users.length > 0) {
                        UI.Layout.showLogin();
                    } else {
                        this.renderSetupForm(div);
                    }
                } else {
                    alert('Koneksi Gagal: ' + (result.message || 'URL tidak valid atau script error.'));
                }
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    },

    renderSetupForm(container) {
        container.innerHTML = `
            <div class="glass-panel w-full max-w-md p-8 rounded-2xl shadow-neon z-10 animate-fade-in">
                <h2 class="text-2xl font-bold mb-2 text-center dark:text-white">Setup Toko Baru</h2>
                <p class="text-center text-gray-500 mb-6">Database kosong. Silahkan buat toko pertama anda.</p>
                
                <form id="setup-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Nama Toko (Outlet)</label>
                        <input type="text" name="outlet_name" required class="w-full rounded-lg input-neon dark:text-white py-3 px-4">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Nama Admin</label>
                        <input type="text" name="admin_name" required class="w-full rounded-lg input-neon dark:text-white py-3 px-4">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                        <input type="email" name="email" required class="w-full rounded-lg input-neon dark:text-white py-3 px-4">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
                        <div class="relative">
                            <input type="password" name="password" id="setup-password" required class="w-full rounded-lg input-neon dark:text-white py-3 px-4 pr-10">
                            <button type="button" onclick="const i = document.getElementById('setup-password'); i.type = i.type === 'password' ? 'text' : 'password';" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            </button>
                        </div>
                    </div>
                    <button type="submit" class="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-neon">
                        Mulai Sekarang
                    </button>
                    <div class="text-center mt-4">
                        <a href="#" onclick="window.location.reload()" class="text-sm text-primary-600 hover:underline">Kembali ke Login</a>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('setup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            // Create Outlet (Type: Main)
            const outlet = DB.insert(DB.OUTLETS, {
                name: data.outlet_name,
                type: 'main',
                parent_id: null
            });

            // Create Admin
            const res = await Auth.register({
                name: data.admin_name,
                email: data.email,
                password: data.password,
                outlet_id: outlet.id,
                role: 'admin'
            });

            if (res.success) {
                await Auth.login(data.email, data.password);

                // Optimization: Sync in background, don't block UI
                Sync.syncData().catch(err => console.error('Background sync failed:', err));

                // Immediate transition
                UI.Layout.init();
            } else {
                alert(res.message);
            }
        });
    },

    showLogin() {
        document.body.innerHTML = '';
        const div = document.createElement('div');
        div.className = 'min-h-screen flex items-center justify-center p-4';
        div.innerHTML = `
            <div class="glass-panel w-full max-w-md p-8 rounded-2xl shadow-neon">
                <h2 class="text-2xl font-bold mb-2 text-center dark:text-white">Login</h2>
                <p class="text-center text-gray-500 mb-6">Masuk ke aplikasi POS.</p>
                <form id="login-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                        <input type="email" name="email" required class="w-full rounded-lg input-neon dark:text-white py-3 px-4">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
                        <div class="relative">
                            <input type="password" name="password" id="login-password" required class="w-full rounded-lg input-neon dark:text-white py-3 px-4 pr-10">
                            <button type="button" onclick="const i = document.getElementById('login-password'); i.type = i.type === 'password' ? 'text' : 'password';" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            </button>
                        </div>
                    </div>
                    <button type="submit" class="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-neon">Masuk</button>
                </form>
                <div class="mt-6 text-center">
                    <button onclick="const div = document.createElement('div'); div.className = 'min-h-screen flex items-center justify-center p-4 relative'; document.body.innerHTML = ''; document.body.appendChild(div); UI.Layout.renderSetupForm(div);" class="text-xs text-gray-400 hover:text-primary-500 transition-colors">
                        Belum punya akun? Setup Toko Baru
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(div);

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            const res = await Auth.login(data.email, data.password);
            if (res.success) {
                // Optimization: Immediate transition without reload
                UI.Layout.init();

                // Trigger background sync if needed
                if (navigator.onLine) {
                    Sync.syncData().catch(console.error);
                }
            } else {
                alert(res.message);
            }
        });
    },

    setupListeners() {
        // Global listeners if any
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const btn = document.getElementById('mobile-menu-btn');
            if (sidebar && !sidebar.contains(e.target) && !btn.contains(e.target) && !sidebar.classList.contains('hidden')) {
                sidebar.classList.add('hidden');
                sidebar.classList.remove('fixed', 'inset-y-0', 'left-0', 'z-40', 'w-64', 'shadow-2xl');
            }
        });
    },

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('hidden')) {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('fixed', 'inset-y-0', 'left-0', 'z-40', 'w-64', 'shadow-2xl', 'flex');
        } else {
            sidebar.classList.add('hidden');
            sidebar.classList.remove('fixed', 'inset-y-0', 'left-0', 'z-40', 'w-64', 'shadow-2xl', 'flex');
        }
    },

    updateInstallButton() {
        const btn = document.getElementById('install-btn');
        if (btn && this.installPrompt) {
            btn.classList.remove('hidden');
        } else if (btn) {
            btn.classList.add('hidden');
        }
    },

    async installApp() {
        if (!this.installPrompt) return;
        this.installPrompt.prompt();
        const { outcome } = await this.installPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        this.installPrompt = null;
        this.updateInstallButton();
    },

    updateOnlineStatus(isOnline) {
        const statusEl = document.getElementById('network-status');
        const syncBtn = document.getElementById('sync-btn');

        if (statusEl) {
            if (isOnline) {
                statusEl.className = 'flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium';
                statusEl.innerHTML = '<div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><span class="hidden sm:inline">Online</span>';
            } else {
                statusEl.className = 'flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium';
                statusEl.innerHTML = '<div class="w-2 h-2 rounded-full bg-red-500"></div><span class="hidden sm:inline">Offline</span>';
            }
        }

        if (syncBtn) {
            if (isOnline) {
                syncBtn.disabled = false;
                syncBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                syncBtn.disabled = true;
                syncBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }
    }
};

// Expose Global Helpers for inline onclicks and API calls
UI.navigate = (viewId) => UI.Layout.navigate(viewId);
UI.updateSyncStatus = (status) => UI.Layout.updateSyncStatus(status);
