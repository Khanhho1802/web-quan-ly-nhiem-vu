// Đường dẫn: frontend/src/components/AdminProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AdminProtectedRoute = () => {
    // Bây giờ, khi component này được render, isInitialized đã là true,
    // và `user` đã là giá trị đúng nhất từ localStorage.
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/tasks" replace />;
    }

    // Nếu là admin, render các route con (ví dụ: AdminDashboardPage)
    return <Outlet />;
};

export default AdminProtectedRoute;