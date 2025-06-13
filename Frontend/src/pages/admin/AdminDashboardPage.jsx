import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Divider, Alert, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../../services/api';

const AdminDashboardPage = () => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState('');

    const handleDownloadExport = async () => {
        setIsDownloading(true);
        setDownloadError('');
        try {
            const response = await api.get('/submissions/admin/download-export/', {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'manual_review.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Lỗi khi tải file:", err);
            if (err.response?.status === 404) {
                setDownloadError("Không tìm thấy file export hoặc chưa có dữ liệu nào được xuất.");
            } else {
                setDownloadError("Không thể tải file. Vui lòng thử lại.");
            }
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Paper sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ color: 'primary.main', mb: 2 }}>
                TRANG TỔNG QUAN CỦA ADMIN
            </Typography>
            <Typography sx={{ mb: 3 }}>
                Đây là nơi chứa các công cụ quản trị của bạn.
            </Typography>
            
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                    component={Link} 
                    to="/admin/submissions" 
                    variant="contained"
                >
                    Quản lý Bài nộp
                </Button>
                <Button 
                    component={Link} 
                    to="/admin/excel-upload" 
                    variant="contained"
                    color="secondary"
                >
                    Upload Excel Đối soát
                </Button>
                <Button
                    component={Link}
                    to="/admin/withdrawals"
                    variant="contained"
                    color="warning"
                >
                    Quản lý Rút tiền
                </Button>
                {/* === Nút mới truy cập trang duyệt đổi thông tin bank === */}
                <Button
                    component={Link}
                    to="/admin/payment-requests"
                    variant="contained"
                    color="info"
                >
                    Duyệt đổi thông tin thanh toán
                </Button>
            </Box>

            <Divider />

            <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Báo cáo & Đối chiếu</Typography>
                {downloadError && <Alert severity="warning" sx={{ mb: 2 }}>{downloadError}</Alert>}
                <Button
                    variant="contained"
                    color="success"
                    startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                    onClick={handleDownloadExport}
                    disabled={isDownloading}
                >
                    {isDownloading ? 'Đang xử lý...' : 'Tải File Dữ Liệu Cần Đối Chiếu'}
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Tải về file .xlsx chứa các bài nộp cần xem xét thủ công.
                </Typography>
            </Box>
        </Paper>
    );
};

export default AdminDashboardPage;
