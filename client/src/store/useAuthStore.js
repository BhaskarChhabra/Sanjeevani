// src/store/useAuthStore.js

import { create } from 'zustand';

// Define the store
const useAuthStore = create((set) => ({
    // State: The initial data
    user: null, // Holds user data if logged in, otherwise null
    isAuthenticated: false, // Tracks if the user is authenticated

    // Actions: Functions to update the state
    // We rely on the rest of your application to call the necessary API and pass the data.
    login: (userData) => set({ user: userData, isAuthenticated: true }),
    
    // 🚨 FIX: Ensure the logout function is explicitly defined
    logout: () => set({ user: null, isAuthenticated: false }),
}));

export default useAuthStore;