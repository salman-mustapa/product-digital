UI.Reports = {
    render(container) {
        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Laporan Transaksi</h2>
                    <div class="flex gap-2">
                        <button onclick="UI.Reports.exportExcel()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Excel
                        </button>
                    </div>
                </div>
                
                <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div class="p-4 border-b border-gray-100 dark:border-slate-700">
                        <input type="text" id="search-report" placeholder="Cari ID Transaksi..." class="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white text-sm">
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th class="p-4 font-medium">ID Transaksi</th>
                                    <th class="p-4 font-medium">Tanggal</th>
                                    <th class="p-4 font-medium">Items</th>
                                    <th class="p-4 font-medium">Total</th>
                                    <th class="p-4 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-slate-700" id="report-list">
                                <!-- List -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        this.loadReports();

        document.getElementById('search-report').addEventListener('input', (e) => {
            this.loadReports(e.target.value);
        });
    },

    loadReports(query = '') {
        const list = document.getElementById('report-list');
        let transactions = DB.findAll(DB.TRANSACTIONS);

        // Sort by date desc
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (query) {
            transactions = transactions.filter(t => t.id.toLowerCase().includes(query.toLowerCase()));
        }

        list.innerHTML = transactions.map(t => {
            const date = new Date(t.date).toLocaleString('id-ID');
            return `
                <tr class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td class="p-4 font-medium dark:text-white font-mono text-xs">#${t.id.substr(-6)}</td>
                    <td class="p-4 text-gray-500">${date}</td>
                    <td class="p-4 text-gray-500">${t.items.length} Item</td>
                    <td class="p-4 font-bold text-primary-600 dark:text-primary-400">Rp ${t.total.toLocaleString('id-ID')}</td>
                    <td class="p-4 text-right">
                        <button onclick="UI.Reports.showDetail('${t.id}')" class="text-blue-600 hover:underline">Detail</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    showDetail(id) {
        const t = DB.findById(DB.TRANSACTIONS, id);
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('hidden');

        overlay.innerHTML = `
            <div class="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-slide-up">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h3 class="text-xl font-bold dark:text-white">Detail Transaksi</h3>
                        <p class="text-sm text-gray-500 font-mono">#${t.id}</p>
                        <p class="text-sm text-gray-500">${new Date(t.date).toLocaleString('id-ID')}</p>
                    </div>
                    <button onclick="document.getElementById('modal-overlay').classList.add('hidden')" class="p-2 text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div class="border-t border-b border-gray-100 dark:border-slate-700 py-4 space-y-3 mb-4">
                    ${t.items.map(i => `
                        <div class="flex justify-between">
                            <div>
                                <p class="font-medium dark:text-white">${i.name}</p>
                                <p class="text-xs text-gray-500">${i.qty} x Rp ${i.price.toLocaleString('id-ID')}</p>
                            </div>
                            <p class="font-medium dark:text-white">Rp ${(i.qty * i.price).toLocaleString('id-ID')}</p>
                        </div>
                    `).join('')}
                </div>
                
                <div class="flex justify-between items-center mb-6">
                    <span class="font-bold text-lg dark:text-white">Total</span>
                    <span class="font-bold text-xl text-primary-600 dark:text-primary-400">Rp ${t.total.toLocaleString('id-ID')}</span>
                </div>
                
                <button onclick="window.print()" class="w-full py-3 border border-gray-300 dark:border-slate-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 dark:text-white">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    Cetak Struk
                </button>
            </div>
        `;
    },

    exportExcel() {
        const transactions = DB.findAll(DB.TRANSACTIONS);
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Tanggal,Total,Items\n";

        transactions.forEach(t => {
            const items = t.items.map(i => `${i.name} (${i.qty})`).join('; ');
            const row = `${t.id},${t.date},${t.total},"${items}"`;
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "laporan_transaksi.csv");
        document.body.appendChild(link);
        link.click();
    }
};
