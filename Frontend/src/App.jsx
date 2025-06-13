import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TaskListPage from './pages/TaskListPage';
import TaskDetailPage from './pages/TaskDetailPage';
import SubmissionHistoryPage from './pages/SubmissionHistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminSubmissionsPage from './pages/admin/AdminSubmissionsPage';
import AdminExcelUploadPage from './pages/admin/AdminExcelUploadPage';
import AdminWithdrawalPage from './pages/admin/AdminWithdrawalPage.jsx';
import AdminPaymentRequestsPage from './pages/admin/AdminPaymentRequestsPage.jsx';
// === THÊM DÒNG NÀY ===
import BankInfoPage from './pages/BankInfoPage';

function App() {
  const { isInitialized, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!isInitialized) {
    return <div>Đang tải ứng dụng...</div>; 
  }

  return (
    <Routes>
      {/* ===== KHU VỰC 1: CÁC ROUTE CÔNG KHAI ===== */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ===== KHU VỰC 2: CÁC ROUTE CHO NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP ===== */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/tasks" />} />
        <Route path="tasks" element={<TaskListPage />} />
        <Route path="task/:taskId" element={<TaskDetailPage />} />
        <Route path="history" element={<SubmissionHistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
        {/* === THÊM ROUTE NÀY CHO BANK INFO PAGE === */}
        <Route path="profile/bank-info" element={<BankInfoPage />} />
      </Route>

      {/* ===== KHU VỰC 3: CÁC ROUTE CHO ADMIN ĐÃ ĐĂNG NHẬP ===== */}
      <Route path="/admin" element={<AdminProtectedRoute />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="submissions" element={<AdminSubmissionsPage />} />
        <Route path="excel-upload" element={<AdminExcelUploadPage />} />
        <Route path="withdrawals" element={<AdminWithdrawalPage />} />
        <Route path="payment-requests" element={<AdminPaymentRequestsPage />} />
      </Route>
      
      {/* ===== KHU VỰC 4: ROUTE DỰ PHÒNG 404 ===== */}
      <Route path="*" element={<div><h1>404 - Trang không tồn tại</h1></div>} />
    </Routes>
  );
}

export default App;
