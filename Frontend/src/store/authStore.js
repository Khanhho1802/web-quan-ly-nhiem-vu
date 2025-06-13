// Đường dẫn: frontend/src/store/authStore.js

import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
    // State
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isInitialized: false,

    // Actions
    setTokens: (access, refresh) => {
        if (access && refresh) {
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            set({ accessToken: access, refreshToken: refresh });
        }
    },

    setUser: (userData) => {
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            localStorage.removeItem('user');
        }
        set({ user: userData });
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        set({ accessToken: null, refreshToken: null, user: null });
    },
    
    fetchUser: async () => {
        try {
            // SỬA LỖI Ở ĐÂY: Đổi '/auth/me/' thành '/auth/profile/'
            const response = await api.get('/auth/profile/');
            get().setUser(response.data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
            get().logout();
            return null;
        }
    },

    initializeAuth: async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            await get().fetchUser();
        }
        set({ isInitialized: true });
    },

    login: async (username, password) => {
        try {
            const loginResponse = await api.post('/auth/login/', { username, password });
            const { access, refresh } = loginResponse.data;
            get().setTokens(access, refresh);

            const user = await get().fetchUser();
            
            return user;
        } catch (error) {
            get().logout();
            throw error;
        }
    },
 
    isAuthenticated: () => {
        return !!get().accessToken;
    }
}));