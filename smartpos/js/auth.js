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

    login(email, password) {
        const users = DB.get(DB.USERS);
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
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

    register(data) {
        // Check if email exists
        const users = DB.get(DB.USERS);
        if (users.find(u => u.email === data.email)) {
            return { success: false, message: 'Email already registered' };
        }

        const newUser = DB.insert(DB.USERS, {
            ...data,
            role: data.role || 'admin'
        });

        return { success: true, user: newUser };
    },

    requireAuth() {
        if (!this.currentUser) {
            // If no users exist, go to setup
            if (!this.isSetup()) {
                UI.Layout.showSetup();
            } else {
                UI.Layout.showLogin();
            }
            return false;
        }
        return true;
    }
};
