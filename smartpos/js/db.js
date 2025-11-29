const DB = {
    // Tables
    USERS: 'users',
    OUTLETS: 'outlets',
    CATEGORIES: 'categories',
    PRODUCTS: 'products',
    TRANSACTIONS: 'transactions',

    // Helper to get table data
    get(table) {
        const data = localStorage.getItem(table);
        return data ? JSON.parse(data) : [];
    },

    // Helper to save table data
    save(table, data) {
        localStorage.setItem(table, JSON.stringify(data));
    },

    // CRUD Operations
    findAll(table, query = {}) {
        const data = this.get(table);
        if (Object.keys(query).length === 0) return data;

        return data.filter(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
    },

    findById(table, id) {
        const data = this.get(table);
        return data.find(item => item.id === id);
    },

    insert(table, item) {
        const data = this.get(table);
        // Check if exists
        if (item.id) {
            const index = data.findIndex(i => i.id === item.id);
            if (index >= 0) {
                // Update existing
                data[index] = { ...data[index], ...item, updated_at: new Date().toISOString() };
                this.save(table, data);
                return data[index];
            }
        }

        // Insert new
        const newItem = {
            id: item.id || this.generateId(table),
            ...item,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        data.push(newItem);
        this.save(table, data);
        return newItem;
    },

    update(table, id, updates) {
        const data = this.get(table);
        const index = data.findIndex(item => item.id === id);
        if (index === -1) return null;

        data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() };
        this.save(table, data);
        return data[index];
    },

    remove(table, id) {
        let data = this.get(table);
        data = data.filter(item => item.id !== id);
        this.save(table, data);
    },

    // Utilities
    generateId(prefix) {
        return (prefix ? prefix.charAt(0) : 'x') + Date.now() + Math.random().toString(36).substr(2, 5);
    },

    // Bulk Insert/Merge (for Sync)
    merge(table, remoteItems) {
        const localItems = this.get(table);
        let updatedCount = 0;
        let newCount = 0;

        remoteItems.forEach(remote => {
            const index = localItems.findIndex(local => local.id === remote.id);
            if (index >= 0) {
                // Conflict resolution: Remote wins for now, or check updated_at
                // Simple strategy: Overwrite local with remote
                localItems[index] = remote;
                updatedCount++;
            } else {
                localItems.push(remote);
                newCount++;
            }
        });

        this.save(table, localItems);
        return { updated: updatedCount, new: newCount };
    }
};
