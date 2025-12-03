// assets/js/app.js

document.addEventListener('DOMContentLoaded', function() {
    // =================================================
    // ============== THEME MANAGEMENT ================
    // =================================================
    const html = document.documentElement;
    const themeButtons = {
        light: document.getElementById('lightTheme'),
        dark: document.getElementById('darkTheme'),
        system: document.getElementById('systemTheme')
    };

    function setTheme(theme) {
        if (theme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
        updateActiveThemeButton(theme);
    }

    function updateActiveThemeButton(theme) {
        if (!themeButtons.light) return; // Exit if theme buttons are not on the page
        Object.values(themeButtons).forEach(btn => btn.classList.remove('ring-2', 'ring-offset-2', 'ring-primary-500'));
        if (themeButtons[theme]) {
            themeButtons[theme].classList.add('ring-2', 'ring-offset-2', 'ring-primary-500');
        }
    }
    
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'light');
        setTheme(theme);
    }

    if (themeButtons.light) { // Only add listeners if buttons exist
        Object.keys(themeButtons).forEach(key => {
            themeButtons[key].addEventListener('click', () => setTheme(key));
        });
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('theme') === 'system') {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });

    initTheme();

    // =================================================
    // ============== SIDEBAR & LOADER ================
    // =================================================
    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('openSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const loader = document.getElementById('loader');

    if (loader) {
        window.addEventListener('load', () => {
            loader.classList.add('hidden');
        });
    }

    if (openSidebarBtn && sidebar) {
        openSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('-translate-x-full');
        });
    }
    if (closeSidebarBtn && sidebar) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
        });
    }

    // =================================================
    // ============== USER MENU ========================
    // =================================================
    const userMenuButton = document.getElementById('userMenuButton');
    const userMenu = document.getElementById('userMenu');

    if (userMenuButton && userMenu) {
        userMenuButton.addEventListener('click', () => {
            userMenu.classList.toggle('hidden');
        });
        window.addEventListener('click', (e) => {
            if (!userMenuButton.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.add('hidden');
            }
        });
    }

    // =================================================
    // ============== FAB (Android Only) ==============
    // =================================================
    const fab = document.getElementById('fab');
    const fabMenu = document.getElementById('fabMenu');

    if (fab && fabMenu) {
        if (/Android/i.test(navigator.userAgent)) {
            fab.classList.remove('hidden');
        }
        fab.addEventListener('click', () => {
            fabMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!fab.contains(e.target) && !fabMenu.contains(e.target)) {
                fabMenu.classList.add('hidden');
            }
        });
    }
});