// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated()) {
    // Nếu chưa đăng nhập, điều hướng người dùng về trang /login
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, cho phép truy cập
  return children;
};

export default ProtectedRoute;