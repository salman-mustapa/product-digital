// assets/js/components.js

// Modal
window.Modal = {
    show: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    },
    hide: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }
};

// Toast
window.Toast = {
    autoHideTimer: null,
    show: function(message, type = 'success', duration = 5000) {
        // Hapus toast yang sudah ada sebelum membuat yang baru
        const existingToast = document.getElementById('toast');
        if (existingToast) {
            existingToast.remove();
        }
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
        }

        // Buat elemen toast
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = `fixed top-20 right-4 z-50 flex items-start p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full max-w-sm w-full`;
        
        // Tentukan ikon dan warna berdasarkan tipe
        let iconSvg = '';
        let bgClass = '';
        switch (type) {
            case 'success':
                bgClass = 'bg-green-500';
                iconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
                break;
            case 'error':
                bgClass = 'bg-red-500';
                iconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
                break;
            case 'warning':
                bgClass = 'bg-yellow-500';
                iconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>';
                break;
            case 'info':
                bgClass = 'bg-blue-500';
                iconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
                break;
        }
        
        toast.innerHTML = `
            <div class="flex-shrink-0 w-6 h-6 text-white ${bgClass} rounded-full flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${iconSvg}
                </svg>
            </div>
            <div class="ml-3 flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">${message}</p>
            </div>
            <button onclick="Toast.hide()" class="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        `;
        
        document.body.appendChild(toast);

        // Tampilkan toast dengan animasi
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
            toast.classList.add('translate-x-0');
        }, 100); // Delay kecil untuk memastikan render

        // Sembunyikan otomatis setelah durasi tertentu
        this.autoHideTimer = setTimeout(() => {
            this.hide();
        }, duration);
    },
    hide: function() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.remove('translate-x-0');
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                toast.remove();
            }, 300); // Tunggu animasi selesai
        }
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
        }
    }
};

// Dropdown
window.Dropdown = {
    toggle: function(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        const button = dropdown.previousElementSibling; // Asumsikan button adalah elemen sebelum dropdown

        // Tutup dropdown lain yang terbuka
        document.querySelectorAll('[id^="dropdown-menu-"]').forEach(menu => {
            if (menu.id !== dropdownId) {
                menu.classList.add('hidden');
                menu.previousElementSibling.setAttribute('aria-expanded', 'false');
            }
        });

        const isOpen = !dropdown.classList.contains('hidden');
        if (isOpen) {
            dropdown.classList.add('hidden');
            button.setAttribute('aria-expanded', 'false');
        } else {
            dropdown.classList.remove('hidden');
            button.setAttribute('aria-expanded', 'true');
        }
    },
    // Tutup dropdown jika klik di luar
    initClickOutside: function() {
        document.addEventListener('click', function(event) {
            if (!event.target.closest('[id^="dropdown-button-"]')) {
                document.querySelectorAll('[id^="dropdown-menu-"]').forEach(menu => {
                    menu.classList.add('hidden');
                    menu.previousElementSibling.setAttribute('aria-expanded', 'false');
                });
            }
        });
    }
};
// Inisialisasi event listener untuk dropdown
document.addEventListener('DOMContentLoaded', () => {
    Dropdown.initClickOutside();
});