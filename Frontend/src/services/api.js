// Đường dẫn: frontend/src/services/api.js

import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  // <<< THAY ĐỔI Ở ĐÂY: Xóa toàn bộ key 'headers' đi >>>
  // headers: {
  //   'Content-Type': 'application/json', // Xóa dòng này
  // },
});

// Thiết lập Interceptor để tự động gắn token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;