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
        set({ accessToken: null, refreshToken: null, user: null });
    },
    
    fetchUser: async () => {
        try {
            const response = await api.get('/users/me/');
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
            set({ accessToken });
            await get().fetchUser();
        }
        set({ isInitialized: true });
    },

    // --- THÊM ACTION LOGIN MỚI ---
    login: async (username, password) => {
        try {
            // Bước 1: Lấy token từ URL ĐÚNG
            const loginResponse = await api.post('/users/login/', { username, password });
            const { access, refresh } = loginResponse.data;
            get().setTokens(access, refresh);

            // Bước 2: Dùng token mới để lấy thông tin user
            const user = await get().fetchUser();
            
            // Trả về thông tin user để LoginPage có thể điều hướng
            return user;
        } catch (error) {
            // Nếu có lỗi, đăng xuất để dọn dẹp state và localStorage
            get().logout();
            // Ném lỗi ra ngoài để LoginPage có thể bắt và hiển thị
            throw error;
        }
    },
 
    isAuthenticated: () => {
        return !!get().accessToken;
    }
}));