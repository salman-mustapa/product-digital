const Auth = {
    currentUser: null,

    init() {
        const session = localStorage.getItem('session_user');
        if (session) {
            this.currentUser = JSON.parse(session);
        }
    },

    isSetup() {
        const users = DB.get(DB.USERS);
        return users.length > 0;
    },

    async hashPassword(password) {
        if (window.crypto && window.crypto.subtle) {
            const msgBuffer = new TextEncoder().encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } else {
            console.warn("Secure context (HTTPS) required for Web Crypto API. Using insecure fallback hash.");
            // Simple insecure hash for development (DJB2 variant)
            let hash = 5381;
            for (let i = 0; i < password.length; i++) {
                hash = ((hash << 5) + hash) + password.charCodeAt(i); /* hash * 33 + c */
            }
            return (hash >>> 0).toString(16).padStart(64, '0'); // Pad to mimic SHA-256 length
        }
    },

    async login(email, password) {
        const users = DB.get(DB.USERS);
        const user = users.find(u => u.email.trim() === email.trim());

        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }

        // 1. Check if password matches hash
        const inputHash = await this.hashPassword(password);
        if (user.password === inputHash) {
            this.currentUser = user;
            localStorage.setItem('session_user', JSON.stringify(user));
            return { success: true, user };
        }

        // 2. Migration: Check if password matches plaintext (Legacy)
        if (user.password === password) {
            console.log('Migrating user password to hash...');
            // Update DB with hash
            user.password = inputHash;
            DB.update(DB.USERS, user.id, { password: inputHash });

            this.currentUser = user;
            localStorage.setItem('session_user', JSON.stringify(user));
            return { success: true, user };
        }

        // 3. Migration: Check if password matches Insecure Fallback Hash (from Localhost)
        // This handles the case where user created account on HTTP (localhost) and logs in on HTTPS (GitHub Pages)
        let fallbackHash = 5381;
        for (let i = 0; i < password.length; i++) {
            fallbackHash = ((fallbackHash << 5) + fallbackHash) + password.charCodeAt(i);
        }
        const fallbackHashHex = (fallbackHash >>> 0).toString(16).padStart(64, '0');

        if (user.password === fallbackHashHex) {
            console.log('Migrating insecure fallback hash to secure SHA-256...');
            user.password = inputHash;
            DB.update(DB.USERS, user.id, { password: inputHash });

            this.currentUser = user;
            localStorage.setItem('session_user', JSON.stringify(user));
            return { success: true, user };
        }

        return { success: false, message: 'Invalid email or password' };
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('session_user');
        window.location.reload();
    },

    async register(data) {
        const users = DB.get(DB.USERS);
        if (users.find(u => u.email === data.email)) {
            return { success: false, message: 'Email already registered' };
        }

        const hashedPassword = await this.hashPassword(data.password);

        const newUser = DB.insert(DB.USERS, {
            ...data,
            password: hashedPassword,
            role: data.role || 'admin'
        });

        return { success: true, user: newUser };
    },

    requireAuth() {
        if (!this.currentUser) {
            if (!this.isSetup()) {
                UI.Layout.showSetup();
            } else {
                UI.Layout.showLogin();
            }
            return false;
        }
        return true;
    },

    getAccessibleOutlets() {
        const user = this.currentUser;
        if (!user) return [];

        const allOutlets = DB.findAll(DB.OUTLETS);
        const userOutlet = allOutlets.find(o => o.id === user.outlet_id);

        if (!userOutlet) return [];

        if (userOutlet.type === 'main' && user.role === 'admin') {
            return allOutlets.filter(o => o.id === userOutlet.id || o.parent_id === userOutlet.id);
        }

        return [userOutlet];
    },

    getUsersByOutlet(outletId) {
        const users = DB.get(DB.USERS);
        if (!outletId) return users;
        return users.filter(u => u.outlet_id === outletId);
    },

    async updateUser(id, data) {
        if (data.password) {
            data.password = await this.hashPassword(data.password);
        }
        return DB.update(DB.USERS, id, data);
    },

    deleteUser(id) {
        return DB.remove(DB.USERS, id);
    }
};
