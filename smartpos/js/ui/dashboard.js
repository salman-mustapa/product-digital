UI.Dashboard = {
    render(container) {
        const products = DB.findAll(DB.PRODUCTS);
        const transactions = DB.findAll(DB.TRANSACTIONS);
        const today = new Date().toISOString().split('T')[0];
        const todayTrans = transactions.filter(t => t.date.startsWith(today));

        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <h2 class="text-2xl font-bold">Dashboard</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <p class="text-sm text-gray-500">Total Produk</p>
                        <p class="text-3xl font-bold text-primary-600">${products.length}</p>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <p class="text-sm text-gray-500">Transaksi Hari Ini</p>
                        <p class="text-3xl font-bold text-blue-600">${todayTrans.length}</p>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <p class="text-sm text-gray-500">Pendapatan Hari Ini</p>
                        <p class="text-3xl font-bold text-green-600">Rp ${todayTrans.reduce((sum, t) => sum + t.total, 0).toLocaleString('id-ID')}</p>
                    </div>
                </div>
                
                <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 class="font-bold mb-4">Produk Stok Menipis</h3>
                    <div class="space-y-3">
                        ${products.filter(p => p.stock < 5).map(p => `
                            <div class="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <span class="font-medium">${p.name}</span>
                                <span class="text-red-600 font-bold">Sisa: ${p.stock}</span>
                            </div>
                        `).join('') || '<p class="text-gray-500">Stok aman.</p>'}
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        // Called when dashboard is default view
        const main = document.getElementById('main-content');
        if (main) this.render(main);
    }
};
