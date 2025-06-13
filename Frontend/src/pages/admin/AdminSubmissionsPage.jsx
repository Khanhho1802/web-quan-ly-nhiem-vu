// Đường dẫn: frontend/src/pages/admin/AdminSubmissionsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Paper, 
    CircularProgress, 
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Tooltip,
    Tabs, // <-- THÊM MỚI
    Tab,   // <-- THÊM MỚI
    Chip   // <-- THÊM MỚI
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../../services/api';

// Hàm tiện ích để định dạng tiền tệ
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm tiện ích để hiển thị trạng thái
const StatusChip = ({ status }) => {
    let color = 'default';
    let label = status;

    if (status === 'completed') {
        color = 'success';
        label = 'Hoàn thành';
    } else if (status === 'rejected') {
        color = 'error';
        label = 'Bị từ chối';
    }

    return <Chip label={label} color={color} size="small" />;
};


const AdminSubmissionsPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTab, setCurrentTab] = useState(0); // 0: Chờ duyệt, 1: Lịch sử

    // State để quản lý các modal
    const [selectedSub, setSelectedSub] = useState(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [isRejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [subToReject, setSubToReject] = useState(null);

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let params = {};
            if (currentTab === 0) {
                params = { status: 'pending' };
            } else {
                // Lấy cả 2 trạng thái cho tab Lịch sử
                params = { status: ['completed', 'rejected'] };
            }
            
            const response = await api.get('/admin/submissions/', { params });
            setSubmissions(response.data.results || response.data);
        } catch (err) {
            console.error("Lỗi khi tải danh sách bài nộp:", err);
            setError("Không thể tải danh sách bài nộp. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [currentTab]); // Thêm currentTab vào dependency

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    // Các hàm xử lý hành động (handleApprove, handleReject) giữ nguyên
    const handleApprove = async (submissionId) => {
        // ...
    };
    const handleReject = async () => {
        // ...
    };

    // Các hàm quản lý Modal giữ nguyên
    const openDetailModal = (submission) => {
        // ...
    };
    const closeDetailModal = () => {
        // ...
    };
    const openRejectModal = (submissionId) => {
        // ...
    };
    const closeRejectModal = () => {
        // ...
    };
    
    // Hàm xử lý thay đổi Tab
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const renderContent = () => {
        if (loading) {
            return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
        }
        if (error) {
            return <Alert severity="error">{error}</Alert>;
        }
        if (submissions.length === 0) {
            return <Typography sx={{ p: 2, textAlign: 'center' }}>Không có dữ liệu.</Typography>;
        }
        // Render bảng "Chờ duyệt"
        if (currentTab === 0) {
            return (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Người nộp</TableCell>
                                <TableCell>Nhiệm vụ</TableCell>
                                <TableCell align="right">Giá mua</TableCell>
                                <TableCell align="right">"Công" dự kiến</TableCell>
                                <TableCell align="center">Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {submissions.map((sub) => {
                                const potentialEarning = sub.effective_target_price_at_submission - sub.purchase_price;
                                return (
                                    <TableRow key={sub.submission_id}>
                                        <TableCell>{sub.submission_id}</TableCell>
                                        <TableCell>{sub.user.username}</TableCell>
                                        <TableCell>{sub.task_title}</TableCell>
                                        <TableCell align="right">{formatCurrency(sub.purchase_price)}</TableCell>
                                        <TableCell align="right" sx={{ color: potentialEarning < 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                                            {formatCurrency(potentialEarning)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Xem chi tiết"><IconButton onClick={() => openDetailModal(sub)} color="primary"><VisibilityIcon /></IconButton></Tooltip>
                                            <Tooltip title="Duyệt nhanh"><IconButton onClick={() => handleApprove(sub.submission_id)} color="success"><CheckCircleIcon /></IconButton></Tooltip>
                                            <Tooltip title="Từ chối nhanh"><IconButton onClick={() => openRejectModal(sub.submission_id)} color="error"><CancelIcon /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        }
        // Render bảng "Lịch sử"
        if (currentTab === 1) {
            return (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Người nộp</TableCell>
                                <TableCell>Nhiệm vụ</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell align="right">"Công" thực nhận</TableCell>
                                <TableCell align="center">Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {submissions.map((sub) => (
                                <TableRow key={sub.submission_id}>
                                    <TableCell>{sub.submission_id}</TableCell>
                                    <TableCell>{sub.user.username}</TableCell>
                                    <TableCell>{sub.task_title}</TableCell>
                                    <TableCell><StatusChip status={sub.status} /></TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(sub.user_earning_calculated)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Xem chi tiết">
                                            <IconButton onClick={() => openDetailModal(sub)} color="primary"><VisibilityIcon /></IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Quản lý Bài nộp</Typography>
            
            <Paper>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={currentTab} onChange={handleTabChange} aria-label="submission tabs">
                        <Tab label="Chờ duyệt" id="tab-0" />
                        <Tab label="Lịch sử" id="tab-1" />
                    </Tabs>
                </Box>
                {renderContent()}
            </Paper>

            {/* Modal xem chi tiết */}
            <Dialog open={isDetailModalOpen} onClose={closeDetailModal} maxWidth="md" fullWidth>
                {/* ... code modal giữ nguyên ... */}
            </Dialog>

            {/* Modal nhập lý do từ chối */}
            <Dialog open={isRejectModalOpen} onClose={closeRejectModal}>
                {/* ... code modal giữ nguyên ... */}
            </Dialog>

        </Box>
    );
};

export default AdminSubmissionsPage;