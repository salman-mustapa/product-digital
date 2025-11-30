UI.Dashboard = {
    chartInstance: null,

    render(container, outletId = '') {
        const products = DB.findAll(DB.PRODUCTS);
        let transactions = DB.findAll(DB.TRANSACTIONS);

        // Filter logic
        const accessibleOutlets = Auth.getAccessibleOutlets();
        const accessibleIds = accessibleOutlets.map(o => String(o.id));

        // 1. Strict Isolation: Filter EVERYTHING by accessible outlets first
        transactions = transactions.filter(t => accessibleIds.includes(String(t.outlet_id)));
        let filteredProducts = products.filter(p => accessibleIds.includes(String(p.outlet_id)));

        // 2. Specific Filter (if selected)
        if (outletId) {
            transactions = transactions.filter(t => String(t.outlet_id) === String(outletId));
            filteredProducts = filteredProducts.filter(p => String(p.outlet_id) === String(outletId));
        }

        const today = new Date().toISOString().split('T')[0];
        const todayTrans = transactions.filter(t => t.date.startsWith(today));

        const stats = {
            totalProducts: filteredProducts.length,
            todayTransactions: todayTrans.length,
            todayRevenue: todayTrans.reduce((sum, t) => sum + t.total, 0),
            lowStock: filteredProducts.filter(p => p.stock < 5)
        };

        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 class="text-2xl font-bold dark:text-white">Dashboard</h2>
                    
                    <div class="flex gap-2 items-center">
                        ${Auth.currentUser.role === 'admin' ? `
                        <select id="dashboard-outlet-filter" class="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-white">
                            <option value="">Semua Outlet</option>
                            ${accessibleOutlets.map(o => `<option value="${o.id}" ${String(o.id) === String(outletId) ? 'selected' : ''}>${o.name}</option>`).join('')}
                        </select>
                        ` : ''}
                        <div class="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                            <button onclick="UI.Dashboard.updateChart('daily')" id="btn-daily" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400">Harian</button>
                            <button onclick="UI.Dashboard.updateChart('monthly')" id="btn-monthly" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">Bulanan</button>
                        </div>
                    </div>
                </div>
                
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="glass-panel rounded-2xl p-6 shadow-sm border border-white/20">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-gray-500 dark:text-gray-400 font-medium">Total Produk</h3>
                            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                            </div>
                        </div>
                        <p class="text-3xl font-bold dark:text-white">${stats.totalProducts}</p>
                    </div>
                    
                    <div class="glass-panel rounded-2xl p-6 shadow-sm border border-white/20">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-gray-500 dark:text-gray-400 font-medium">Transaksi Hari Ini</h3>
                            <div class="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                            </div>
                        </div>
                        <p class="text-3xl font-bold dark:text-white">${stats.todayTransactions}</p>
                    </div>
                    
                    <div class="glass-panel rounded-2xl p-6 shadow-sm border border-white/20">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-gray-500 dark:text-gray-400 font-medium">Pendapatan Hari Ini</h3>
                            <div class="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                        </div>
                        <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">Rp ${stats.todayRevenue.toLocaleString('id-ID')}</p>
                    </div>
                </div>

                <!-- Chart Section -->
                <div class="glass-panel rounded-2xl p-6 shadow-sm border border-white/20">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-bold dark:text-white">Grafik Penjualan</h3>
                        <input type="date" id="chart-date-filter" class="rounded-lg border border-gray-300 dark:border-slate-600 bg-transparent px-3 py-1 text-sm dark:text-white" value="${today}">
                    </div>
                    <div class="h-80 w-full">
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>
                
                <!-- Low Stock Alert -->
                <div class="glass-panel rounded-2xl shadow-sm border border-white/20 p-6">
                    <h3 class="text-lg font-bold mb-4 dark:text-white">Stok Menipis</h3>
                    ${stats.totalProducts === 0 ? `
                        <div class="text-center py-8">
                            <div class="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">📦</div>
                            <p class="text-gray-500 dark:text-gray-400 mb-3">Belum ada produk.</p>
                            <button onclick="UI.navigate('products')" class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700">Tambah Produk</button>
                        </div>
                    ` : stats.lowStock.length > 0 ? `
                        <div class="space-y-3">
                            ${stats.lowStock.map(p => `
                                <div class="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-xl">📦</div>
                                        <div>
                                            <p class="font-medium dark:text-white">${p.name}</p>
                                            <p class="text-xs text-gray-500 dark:text-gray-400">${!outletId && Auth.currentUser.role === 'admin' ? (DB.findById(DB.OUTLETS, p.outlet_id)?.name || '-') : ''}</p>
                                            <p class="text-xs text-red-600 dark:text-red-400">Sisa: ${p.stock}</p>
                                        </div>
                                    </div>
                                    <button onclick="UI.Products.edit('${p.id}')" class="px-3 py-1 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700">Restock</button>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="text-center py-8">
                            <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl text-green-600">👍</div>
                            <p class="text-gray-500 dark:text-gray-400">Semua stok aman!</p>
                        </div>
                    `}
                </div>
            </div>
        `;

        this.initChart('daily');

        document.getElementById('chart-date-filter').addEventListener('change', (e) => {
            this.updateChartData(e.target.value);
        });

        if (document.getElementById('dashboard-outlet-filter')) {
            document.getElementById('dashboard-outlet-filter').addEventListener('change', (e) => {
                this.renderStats(e.target.value);
            });
        }
    },

    renderStats(outletId = '') {
        const main = document.getElementById('main-content');
        this.render(main, outletId);
    },

    initChart(mode) {
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const ctx = document.getElementById('salesChart').getContext('2d');
        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e2e8f0' : '#64748b';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: this.getChartData(mode, document.getElementById('dashboard-outlet-filter')?.value || ''),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor }
                    }
                }
            }
        });
    },

    updateChart(mode) {
        const btnDaily = document.getElementById('btn-daily');
        const btnMonthly = document.getElementById('btn-monthly');

        if (mode === 'daily') {
            btnDaily.className = "px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400";
            btnMonthly.className = "px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors";
        } else {
            btnMonthly.className = "px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400";
            btnDaily.className = "px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors";
        }

        const outletId = document.getElementById('dashboard-outlet-filter')?.value || '';
        const data = this.getChartData(mode, outletId);
        this.chartInstance.data = data;
        this.chartInstance.update();
    },

    updateChartData(dateStr) {
        // Log removed
        // In a real app, this would re-fetch data based on date
    },

    getChartData(mode, outletId = '') {
        let transactions = DB.findAll(DB.TRANSACTIONS);

        // Filter logic for Chart (must match renderStats logic)
        const accessibleOutlets = Auth.getAccessibleOutlets();
        const accessibleIds = accessibleOutlets.map(o => String(o.id));

        transactions = transactions.filter(t => accessibleIds.includes(String(t.outlet_id)));

        if (outletId) {
            transactions = transactions.filter(t => String(t.outlet_id) === String(outletId));
        }

        const labels = [];
        const data = [];

        if (mode === 'daily') {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                labels.push(d.toLocaleDateString('id-ID', { weekday: 'short' }));

                const dailyTotal = transactions
                    .filter(t => t.date.startsWith(dateStr))
                    .reduce((sum, t) => sum + t.total, 0);
                data.push(dailyTotal);
            }
        } else {
            // Last 6 months
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthStr = d.toISOString().slice(0, 7); // YYYY-MM
                labels.push(d.toLocaleDateString('id-ID', { month: 'short' }));

                const monthlyTotal = transactions
                    .filter(t => t.date.startsWith(monthStr))
                    .reduce((sum, t) => sum + t.total, 0);
                data.push(monthlyTotal);
            }
        }

        return {
            labels: labels,
            datasets: [{
                label: 'Penjualan',
                data: data,
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };
    },

    init() {
        const main = document.getElementById('main-content');
        if (main) this.render(main);
    }
};
