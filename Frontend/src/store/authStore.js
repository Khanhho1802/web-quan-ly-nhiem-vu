import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isInitialized: false,

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

    refreshAccessToken: async () => {
        try {
            const refresh = get().refreshToken;
            if (!refresh) throw new Error("No refresh token");

            const response = await api.post('/users/token/refresh/', { refresh });
            const { access } = response.data;
            get().setTokens(access, refresh);
            return access;
        } catch (error) {
            console.error("Lỗi khi làm mới token:", error);
            get().logout();
            throw error;
        }
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

    login: async (username, password) => {
        try {
            const loginResponse = await api.post('/users/login/', { username, password });
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
