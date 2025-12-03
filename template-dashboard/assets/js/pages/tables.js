// assets/js/pages/tables.js

// --- TABLE MANAGER OBJECT ---
// This object will manage the state and logic for each table
const TableManager = {
    tables: {
        users: {
            data: [
                { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', status: 'Active', joinDate: '2023-01-15' },
                { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Editor', status: 'Active', joinDate: '2023-02-20' },
                { id: 3, name: 'Peter Jones', email: 'peter.jones@example.com', role: 'Member', status: 'Inactive', joinDate: '2023-03-10' },
                { id: 4, name: 'Mary Johnson', email: 'mary.johnson@example.com', role: 'Member', status: 'Pending', joinDate: '2023-04-05' },
                { id: 5, name: 'Tom Brown', email: 'tom.brown@example.com', role: 'Editor', status: 'Active', joinDate: '2023-05-12' },
                { id: 6, name: 'David Williams', email: 'david.williams@example.com', role: 'Member', status: 'Active', joinDate: '2023-06-18' },
                { id: 7, name: 'Susan Miller', email: 'susan.miller@example.com', role: 'Admin', status: 'Active', joinDate: '2023-07-22' },
                { id: 8, name: 'Chris Wilson', email: 'chris.wilson@example.com', role: 'Member', status: 'Inactive', joinDate: '2023-08-30' },
                { id: 9, name: 'Patricia Moore', email: 'patricia.moore@example.com', role: 'Editor', status: 'Active', joinDate: '2023-09-14' },
                { id: 10, name: 'Robert Taylor', email: 'robert.taylor@example.com', role: 'Member', status: 'Pending', joinDate: '2023-10-01' },
                { id: 11, name: 'Linda Anderson', email: 'linda.anderson@example.com', role: 'Admin', status: 'Active', joinDate: '2023-11-11' },
                { id: 12, name: 'Michael Thomas', email: 'michael.thomas@example.com', role: 'Member', status: 'Active', joinDate: '2023-12-05' },
                { id: 13, name: 'Sarah Jackson', email: 'sarah.jackson@example.com', role: 'Editor', status: 'Active', joinDate: '2024-01-20' },
                { id: 14, name: 'Kevin White', email: 'kevin.white@example.com', role: 'Member', status: 'Inactive', joinDate: '2024-02-15' },
                { id: 15, name: 'Nancy Harris', email: 'nancy.harris@example.com', role: 'Admin', status: 'Active', joinDate: '2024-03-22' },
            ],
            currentPage: 1,
            itemsPerPage: 5,
            sortColumn: 'id',
            sortDirection: 'asc'
        },
        products: {
            data: [
                { id: 'P001', name: 'Laptop Pro', category: 'Electronics', stock: 50, price: 1200, status: 'Available' },
                { id: 'P002', name: 'Wireless Mouse', category: 'Electronics', stock: 150, price: 25, status: 'Available' },
                { id: 'P003', name: 'Mechanical Keyboard', category: 'Electronics', stock: 75, price: 150, status: 'Available' },
                { id: 'P004', name: '4K Monitor', category: 'Electronics', stock: 0, price: 300, status: 'Out of Stock' },
                { id: 'P005', name: 'Office Chair', category: 'Furniture', stock: 30, price: 250, status: 'Available' },
                { id: 'P006', name: 'Standing Desk', category: 'Furniture', stock: 0, price: 450, status: 'Out of Stock' },
            ],
            currentPage: 1,
            itemsPerPage: 5,
            sortColumn: 'id',
            sortDirection: 'asc'
        },
        orders: {
            data: [
                { id: 'ORD123', customer: 'Jane Smith', product: 'Laptop Pro', amount: 1250, status: 'Shipped', date: '2024-05-10' },
                { id: 'ORD124', customer: 'Peter Jones', product: 'Wireless Mouse', amount: 25, status: 'Processing', date: '2024-05-12' },
                { id: 'ORD125', customer: 'Mary Johnson', product: 'Mechanical Keyboard', amount: 150, status: 'Delivered', date: '2024-05-08' },
                { id: 'ORD126', customer: 'Tom Brown', product: '4K Monitor', amount: 300, status: 'Pending', date: '2024-05-13' },
                { id: 'ORD127', customer: 'David Williams', product: 'Office Chair', amount: 250, status: 'Shipped', date: '2024-05-15' },
            ],
            currentPage: 1,
            itemsPerPage: 5,
            sortColumn: 'id',
            sortDirection: 'asc'
        }
    },
    activeTable: 'users',

    init() {
        // Set up event listeners for search and filter for the active table
        this.setupEventListeners(this.activeTable);
        // Initial render
        this.renderTable(this.activeTable);
    },

    setupEventListeners(tableId) {
        const tableConfig = this.tables[tableId];
        if (!tableConfig) return;

        const searchInput = document.getElementById(`${tableId}-table-search`);
        const statusFilter = document.getElementById(`${tableId}-status-filter`);

        if (searchInput) {
            searchInput.removeEventListener('keyup', tableConfig.searchHandler);
            tableConfig.searchHandler = () => this.applyFiltersAndSearch(tableId);
            searchInput.addEventListener('keyup', tableConfig.searchHandler);
        }
        if (statusFilter) {
            statusFilter.removeEventListener('change', tableConfig.filterHandler);
            tableConfig.filterHandler = () => this.applyFiltersAndSearch(tableId);
            statusFilter.addEventListener('change', tableConfig.filterHandler);
        }
    },

    applyFiltersAndSearch(tableId) {
        const tableConfig = this.tables[tableId];
        if (!tableConfig) return;

        const searchTerm = document.getElementById(`${tableId}-table-search`).value.toLowerCase();
        const filterValue = document.getElementById(`${tableId}-status-filter`).value;

        // Create a shallow copy of the original data to filter
        let originalData = this.tables[tableId].originalData || this.tables[tableId].data;
        this.tables[tableId].data = originalData.filter(item => {
            // Simple search logic (can be expanded)
            const matchesSearch = Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm));
            const matchesFilter = filterValue === '' || item.status === filterValue;
            return matchesSearch && matchesFilter;
        });

        this.tables[tableId].currentPage = 1;
        this.renderTable(tableId);
    },

    sortTable(tableId, column) {
        const tableConfig = this.tables[tableId];
        if (!tableConfig) return;

        if (tableConfig.sortColumn === column) {
            tableConfig.sortDirection = tableConfig.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            tableConfig.sortColumn = column;
            tableConfig.sortDirection = 'asc';
        }

        tableConfig.data.sort((a, b) => {
            let valueA = a[column];
            let valueB = b[column];
            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }
            if (valueA < valueB) return tableConfig.sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return tableConfig.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.renderTable(tableId);
    },

    renderTable(tableId) {
        const tableConfig = this.tables[tableId];
        if (!tableConfig) return;

        const totalPages = Math.ceil(tableConfig.data.length / tableConfig.itemsPerPage);
        const startIndex = (tableConfig.currentPage - 1) * tableConfig.itemsPerPage;
        const endIndex = startIndex + tableConfig.itemsPerPage;
        const paginatedData = tableConfig.data.slice(startIndex, endIndex);

        // Render desktop table
        const desktopTableBody = document.getElementById(`${tableId}-desktop-table-body`);
        if (desktopTableBody) {
            desktopTableBody.innerHTML = '';
            paginatedData.forEach(item => {
                const statusClass = item.status === 'Active' || item.status === 'Available' || item.status === 'Shipped' || item.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    item.status === 'Inactive' || item.status === 'Out of Stock' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
                const row = `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${item.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${item.name}</td>
                        ${item.email ? `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${item.email}</td>` : ''}
                        ${item.role ? `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${item.role}</td>` : ''}
                        ${item.category ? `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${item.category}</td>` : ''}
                        ${item.customer ? `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${item.customer}</td>` : ''}
                        ${item.stock ? `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${item.stock}</td>` : ''}
                        ${item.price ? `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">$${item.price.toFixed(2)}</td>` : ''}
                        ${item.amount ? `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">$${item.amount.toFixed(2)}</td>` : ''}
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                                ${item.status}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onclick="viewUser(${item.id})" class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-3">View</button>
                            <button onclick="editUser(${item.id})" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3">Edit</button>
                            <button onclick="deleteUser(${item.id})" class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Delete</button>
                        </td>
                    </tr>
                `;
                desktopTableBody.innerHTML += row;
            });
        }

        // Render mobile cards
        const mobileView = document.getElementById(`${tableId}-mobile-view`);
        if (mobileView) {
            mobileView.innerHTML = '';
            paginatedData.forEach(item => {
                const statusClass = item.status === 'Active' || item.status === 'Available' || item.status === 'Shipped' || item.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    item.status === 'Inactive' || item.status === 'Out of Stock' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
                const card = `
                    <div class="glass p-4 rounded-lg shadow-md">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex items-center">
                                <img class="h-10 w-10 rounded-full" src="https://i.pravatar.cc/150?u=${item.email || item.id}" alt="">
                                <div class="ml-3">
                                    <div class="text-lg font-medium text-gray-900 dark:text-white">${item.name}</div>
                                    ${item.role ? `<div class="text-sm text-gray-500 dark:text-gray-400">${item.role}</div>` : ''}
                                    ${item.category ? `<div class="text-sm text-gray-500 dark:text-gray-400">${item.category}</div>` : ''}
                                </div>
                            </div>
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                                ${item.status}
                            </span>
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            ${item.email ? `<p>${item.email}</p>` : ''}
                            ${item.customer ? `<p>Customer: ${item.customer}</p>` : ''}
                            ${item.stock ? `<p>Stock: ${item.stock}</p>` : ''}
                            ${item.price ? `<p>Price: $${item.price.toFixed(2)}</p>` : ''}
                            ${item.amount ? `<p>Amount: $${item.amount.toFixed(2)}</p>` : ''}
                        </div>
                        <div class="flex justify-end space-x-2">
                            <button onclick="viewUser(${item.id})" class="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700">View</button>
                            <button onclick="editUser(${item.id})" class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Edit</button>
                            <button onclick="deleteUser(${item.id})" class="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                `;
                mobileView.innerHTML += card;
            });
        }
        this.updatePagination(tableId, totalPages);
    },

    updatePagination(tableId, totalPages) {
        const tableConfig = this.tables[tableId];
        if (!tableConfig) return;

        const pageInfo = document.getElementById(`${tableId}-pagination-controls`);
        if (!pageInfo) return;

        const startItem = (tableConfig.currentPage - 1) * tableConfig.itemsPerPage + 1;
        const endItem = Math.min(tableConfig.currentPage * tableConfig.itemsPerPage, tableConfig.data.length);
        
        // This is a simplified pagination control for demonstration
        pageInfo.innerHTML = `
            <span class="text-sm text-gray-700 dark:text-gray-300">
                Showing <span class="font-medium">${startItem}</span> to <span class="font-medium">${endItem}</span> of <span class="font-medium">${tableConfig.data.length}</span> results
            </span>
            <div class="flex gap-2">
                <button onclick="TableManager.changePage('${tableId}', -1)" class="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 ${tableConfig.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}">
                    Previous
                </button>
                <button onclick="TableManager.changePage('${tableId}', 1)" class="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 ${tableConfig.currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}">
                    Next
                </button>
            </div>
        `;
    },
    
    changePage(tableId, direction) {
        const tableConfig = this.tables[tableId];
        if (!tableConfig) return;
        
        const totalPages = Math.ceil(tableConfig.data.length / tableConfig.itemsPerPage);
        tableConfig.currentPage += direction;
        if (tableConfig.currentPage < 1) tableConfig.currentPage = 1;
        if (tableConfig.currentPage > totalPages) tableConfig.currentPage = totalPages;
        
        this.renderTable(tableId);
    },

    goToPage(tableId, page) {
        const tableConfig = this.tables[tableId];
        if (!tableConfig) return;
        
        tableConfig.currentPage = page;
        this.renderTable(tableId);
    },

    deleteItem(tableId, itemId) {
        const tableConfig = this.tables[tableId];
        if (!tableConfig) return;
        
        if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            // In a real application, you would send an AJAX request to delete the item
            // For this demo, we'll just remove it from our data array
            tableConfig.data = tableConfig.data.filter(item => item.id !== itemId);
            
            // Re-apply filters and render the table
            this.applyFiltersAndSearch(tableId);
            Toast.show('Item deleted successfully!', 'success');
        }
    },

    exportToCSV(tableId) {
        const tableConfig = this.tables[tableId];
        if (!tableConfig) return;

        const headers = Object.keys(tableConfig.data[0]);
        const csvContent = [
            headers.join(','),
            ...tableConfig.data.map(item => headers.map(header => item[header]).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${tableId}_export.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Toast.show(`Table exported to CSV!`, 'success');
    },
    
    exportToPDF(tableId) {
        const tableConfig = this.tables[tableId];
        if (!tableConfig) return;
        
        // Create a new window and write the table HTML
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${tableId.charAt(0).toUpperCase() + tableId.slice(1)} Table PDF Export</title>
                    <style>
                        body { font-family: 'Quicksand', sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>${tableId.charAt(0).toUpperCase() + tableId.slice(1)} Table</h1>
                    <table>
                        <thead>
                            <tr>${Object.keys(tableConfig.data[0]).map(key => `<th>${key}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                            ${tableConfig.data.map(item => `<tr>${Object.values(item).map(val => `<td>${val}</td>`).join('')}</tr>`).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        
        // Trigger print dialog
        printWindow.print();
        
        Toast.show(`Print dialog opened. You can save as PDF from there.`, 'info');
    },

    switchTable(tableId) {
        // Hide all tables
        document.querySelectorAll('.table-container').forEach(container => {
            container.classList.add('hidden');
        });
        
        // Deactivate all tabs
        document.querySelectorAll('.table-tab-btn').forEach(btn => {
            btn.classList.remove('border-primary-500', 'text-primary-600');
            btn.classList.add('border-transparent', 'text-gray-500');
        });

        // Show selected table and activate its tab
        const selectedContainer = document.getElementById(`${tableId}-table-container`);
        const selectedTab = document.querySelector(`[data-tab="${tableId}"]`);
        
        if (selectedContainer) {
            selectedContainer.classList.remove('hidden');
        }
        if (selectedTab) {
            selectedTab.classList.remove('border-transparent', 'text-gray-500');
            selectedTab.classList.add('border-primary-500', 'text-primary-600');
        }
        
        this.activeTable = tableId;
        this.init(); // Re-initialize with the new active table
    }
};

// --- GLOBAL FUNCTIONS ---
// These functions are now in the global scope so they can be called from HTML onclick attributes
function changePage(tableId, direction) { TableManager.changePage(tableId, direction); }
function goToPage(tableId, page) { TableManager.goToPage(tableId, page); }
function viewUser(id) { 
    Modal.show('viewUserModal'); 
    const user = TableManager.tables['users'].data.find(u => u.id === id); 
    if (user) { 
        const modalBody = document.getElementById('viewUserModalBody'); 
        modalBody.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center">
                    <img class="h-20 w-20 rounded-full" src="https://i.pravatar.cc/150?u=${user.email}" alt="">
                    <div class="ml-4">
                        <p class="text-lg font-medium text-gray-900 dark:text-white">${user.name}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${user.role || 'N/A'}</p>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${user.email || 'N/A'}</p>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : user.status === 'Inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}">${user.status}</span>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Join Date</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${user.joinDate || 'N/A'}</p>
                </div>
            </div>
        `; 
    } 
}
function editUser(id) { 
    Modal.show('editUserModal'); 
    const user = TableManager.tables['users'].data.find(u => u.id === id); 
    if (user) { 
        const modalBody = document.getElementById('editUserModalBody'); 
        modalBody.innerHTML = `
            <form class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input type="text" value="${user.name}" class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input type="email" value="${user.email}" class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                    <select class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700">
                        <option ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                        <option ${user.role === 'Editor' ? 'selected' : ''}>Editor</option>
                        <option ${user.role === 'Member' ? 'selected' : ''}>Member</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700">
                        <option ${user.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option ${user.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                        <option ${user.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    </select>
                </div>
                <div class="flex justify-end space-x-2">
                    <button type="button" onclick="Modal.hide('editUserModal')" class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700">
                        Cancel
                    </button>
                    <button type="button" onclick="saveUserChanges(${id})" class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                        Save Changes
                    </button>
                </div>
            </form>
        `; 
    } 
}
function deleteUser(id) { 
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) { 
        TableManager.deleteItem('users', id); 
    } 
}
function exportTableToCSV(tableId) { TableManager.exportToCSV(tableId); }
function exportTableToPDF(tableId) { TableManager.exportToPDF(tableId); }
function saveUserChanges(id) { 
    const userIndex = TableManager.tables['users'].data.findIndex(u => u.id === id); 
    if (userIndex !== -1) { 
        const form = document.querySelector('#editUserModalBody form'); 
        TableManager.tables['users'].data[userIndex].name = form.querySelector('input[type="text"]').value;
        TableManager.tables['users'].data[userIndex].email = form.querySelector('input[type="email"]').value;
        TableManager.tables['users'].data[userIndex].role = form.querySelector('select').value;
        TableManager.tables['users'].data[userIndex].status = form.querySelectorAll('select')[1].value;
        
        // Re-apply filters and render the table
        TableManager.applyFiltersAndSearch('users');
        Toast.show('User information updated successfully!', 'success');
        Modal.hide('editUserModal');
    } 
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    // Store original data before any filtering
    Object.keys(TableManager.tables).forEach(key => {
        TableManager.tables[key].originalData = [...TableManager.tables[key].data];
    });

    TableManager.init();
});