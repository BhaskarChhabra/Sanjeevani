import { create } from 'zustand';

// Helper functions for localStorage
const saveToStorage = (userData) => {
    localStorage.setItem('auth', JSON.stringify(userData));
};

const getFromStorage = () => {
    const stored = localStorage.getItem('auth');
    return stored ? JSON.parse(stored) : null;
};

// Create store
const useAuthStore = create((set) => ({
    user: getFromStorage(), // restore user on page load
    isAuthenticated: !!getFromStorage(),

    login: (userData) => {
        saveToStorage(userData); // persist to localStorage
        set({ user: userData, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('auth'); // clear storage
        set({ user: null, isAuthenticated: false });
    },
}));

export default useAuthStore;
