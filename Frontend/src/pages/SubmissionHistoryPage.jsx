// Đường dẫn: frontend/src/pages/SubmissionHistoryPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Box, Typography, CircularProgress, Alert, Paper, Chip, Tooltip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Button, Tabs, Tab, Dialog, DialogActions, DialogContent, 
    DialogTitle, TextField, DialogContentText, Snackbar
} from '@mui/material';
import api from '../services/api';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const SubmissionHistoryPage = () => {
    // --- KHAI BÁO STATE ---
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    const [editingSub, setEditingSub] = useState(null);
    const [newTrackingCode, setNewTrackingCode] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');

    const [confirmingSub, setConfirmingSub] = useState(null);
    const [confirmError, setConfirmError] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);

    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    // --- CÁC HÀM XỬ LÝ ---
    const fetchSubmissions = async () => {
        try {
            const response = await api.get('/submissions/my-history/');
            setSubmissions(response.data.results || response.data);
        } catch (err) {
            console.error("Lỗi khi tải lịch sử:", err);
            // Chỉ đặt lỗi nếu state submissions đang rỗng
            if (submissions.length === 0) {
                setError("Không thể tải lịch sử. Vui lòng thử lại.");
            }
        } finally {
            if (loading) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);
    
    const filteredSubmissions = useMemo(() => {
        switch (tabValue) {
            case 0: // Chờ duyệt
                return submissions.filter(sub => sub.status === 'pending' && !sub.is_admin_approved);
            case 1: // Admin đã duyệt
                return submissions.filter(sub => sub.is_admin_approved && (sub.status === 'pending' || sub.status === 'exported_for_review'));
            case 2: // Đã hoàn thành
                return submissions.filter(sub => sub.status === 'completed');
            case 3: // Bị từ chối
                return submissions.filter(sub => sub.status === 'rejected');
            default:
                return [];
        }
    }, [submissions, tabValue]);

    const totalAmount = useMemo(() => {
        if (tabValue === 3) return null;
        return filteredSubmissions.reduce((sum, sub) => {
            const amount = (tabValue === 2) ? sub.user_earning_calculated : sub.potential_earning;
            return sum + (Number(amount) || 0);
        }, 0);
    }, [filteredSubmissions, tabValue]);

    const handleTabChange = (event, newValue) => setTabValue(newValue);

    const handleOpenUpdateDialog = (submission) => {
        setEditingSub(submission);
        setNewTrackingCode(submission.tracking_code || '');
        setUpdateError('');
    };
    const handleCloseUpdateDialog = () => setEditingSub(null);
    const handleUpdateTrackingCode = async () => {
        if (!newTrackingCode.trim()) {
            setUpdateError("Mã vận đơn không được để trống.");
            return;
        }
        setIsUpdating(true);
        setUpdateError('');
        try {
            const response = await api.patch(`/submissions/${editingSub.submission_id}/update-tracking/`, {
                tracking_code: newTrackingCode
            });
            setSubmissions(submissions.map(s => s.submission_id === editingSub.submission_id ? response.data : s));
            setSnackbar({ open: true, message: 'Cập nhật mã vận đơn thành công!' });
            handleCloseUpdateDialog();
        } catch (err) {
            console.error("Lỗi khi cập nhật mã vận đơn:", err.response?.data);
            setUpdateError(err.response?.data?.detail || "Có lỗi xảy ra.");
        } finally {
            setIsUpdating(false);
        }
    };
    
    const handleOpenConfirmDialog = (submission) => {
        setConfirmingSub(submission);
        setConfirmError('');
    };
    const handleCloseConfirmDialog = () => setConfirmingSub(null);

    // <<< THAY ĐỔI 1: Sửa logic hàm xác nhận giao hàng >>>
    const handleConfirmDelivery = async () => {
        if (!confirmingSub) return;
        setIsConfirming(true);
        setConfirmError('');
        try {
            // Gọi API như cũ
            await api.post(`/submissions/${confirmingSub.submission_id}/confirm-delivery/`);

            // Thay vì fetch lại, hãy cập nhật state trực tiếp
            setSubmissions(currentSubmissions =>
                currentSubmissions.map(s =>
                    s.submission_id === confirmingSub.submission_id
                        ? { ...s, status: 'exported_for_review' } // Cập nhật trạng thái của submission vừa được xác nhận
                        : s
                )
            );
            
            handleCloseConfirmDialog();
            setSnackbar({ open: true, message: 'Đã báo giao hàng thành công!' });

        } catch(err) {
            console.error("Lỗi khi xác nhận giao hàng:", err.response?.data);
            setConfirmError(err.response?.data?.error || err.response?.data?.message || "Có lỗi xảy ra, không thể xác nhận.");
        } finally {
            setIsConfirming(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Nhiệm vụ đã thực hiện</Typography>
            <Paper>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="Submission status tabs" variant="scrollable" scrollButtons="auto">
                        <Tab label="Chờ duyệt" />
                        <Tab label="Admin đã duyệt" />
                        <Tab label="Đã hoàn thành" />
                        <Tab label="Bị từ chối" />
                    </Tabs>
                </Box>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    {totalAmount !== null && (
                         <Typography variant="h6">
                            {tabValue === 2 ? 'Tổng công đã nhận: ' : 'Tổng công dự kiến: '}
                            <Typography component="span" variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                                {formatCurrency(totalAmount)}
                            </Typography>
                        </Typography>
                    )}
                </Box>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tên nhiệm vụ</TableCell>
                                <TableCell>Giá mua</TableCell>
                                <TableCell>Mã vận đơn</TableCell>
                                <TableCell>{tabValue === 2 ? 'Công đã nhận' : 'Công dự kiến'}</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell align="center">Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSubmissions.length > 0 ? filteredSubmissions.map((sub) => (
                                <TableRow key={sub.submission_id} hover>
                                    <TableCell>{sub.task_title}</TableCell>
                                    <TableCell>{formatCurrency(sub.purchase_price)}</TableCell>
                                    <TableCell>
                                        {sub.tracking_code || 'Chưa có'}
                                        {!sub.is_admin_approved && sub.status === 'pending' && (
                                            <Button size="small" sx={{ ml: 1 }} onClick={() => handleOpenUpdateDialog(sub)}>
                                                {sub.tracking_code ? 'Sửa' : 'Thêm'}
                                            </Button>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(tabValue === 2 ? sub.user_earning_calculated : sub.potential_earning)}
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={sub.admin_rejection_reason || sub.status}>
                                            <Chip 
                                                label={sub.status === 'exported_for_review' ? 'Chờ đối chiếu' : sub.status} 
                                                color={sub.status === 'completed' ? 'success' : sub.status === 'rejected' ? 'error' : 'warning'} 
                                            />
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="center">
                                        {/* <<< THAY ĐỔI 2: Thêm logic điều kiện render nút >>> */}
                                        {tabValue === 1 && (
                                            <>
                                                {sub.status === 'pending' && (
                                                    <Button 
                                                        variant="contained" 
                                                        color="primary" 
                                                        size="small"
                                                        startIcon={<CheckCircleOutlineIcon />}
                                                        onClick={() => handleOpenConfirmDialog(sub)}
                                                    >
                                                        Đã giao
                                                    </Button>
                                                )}
                                                {sub.status === 'exported_for_review' && (
                                                     <Button 
                                                        variant="contained" 
                                                        color="success" // Đổi màu để thể hiện sự thành công
                                                        size="small"
                                                        disabled      // Vô hiệu hóa nút
                                                        startIcon={<CheckCircleIcon />} // Đổi icon để trực quan hơn
                                                    >
                                                        Đã báo giao
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={6} align="center">Không có dữ liệu</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={!!editingSub} onClose={handleCloseUpdateDialog}>
                {/* ... Nội dung Dialog cập nhật mã vận đơn không đổi ... */}
                <DialogTitle>Cập nhật mã vận đơn</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Mã vận đơn mới" type="text" fullWidth variant="standard" value={newTrackingCode} onChange={(e) => setNewTrackingCode(e.target.value)}/>
                    {updateError && <Alert severity="error" sx={{ mt: 2 }}>{updateError}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUpdateDialog}>Hủy</Button>
                    <Button onClick={handleUpdateTrackingCode} disabled={isUpdating}>{isUpdating ? 'Đang lưu...' : 'Lưu'}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!confirmingSub} onClose={handleCloseConfirmDialog}>
                 {/* ... Nội dung Dialog xác nhận không đổi ... */}
                <DialogTitle>Xác nhận Đơn hàng đã được giao?</DialogTitle>
                <DialogContent>
                    <DialogContentText>Hành động này sẽ thông báo cho hệ thống rằng đơn hàng đã đến tay người nhận và sẵn sàng cho bước đối chiếu cuối cùng.</DialogContentText>
                    <Alert severity="warning" sx={{ mt: 2 }}><b>Lưu ý:</b> Bạn chỉ nên thực hiện khi đơn hàng đã giao thành công. Việc xác nhận sai có thể ảnh hưởng đến kết quả của nhiệm vụ.</Alert>
                    {confirmError && <Alert severity="error" sx={{ mt: 1 }}>{confirmError}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog}>Hủy</Button>
                    <Button color="primary" variant="contained" onClick={handleConfirmDelivery} disabled={isConfirming}>{isConfirming ? 'Đang xử lý...' : 'Tôi xác nhận'}</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
        </Box>
    );
};

export default SubmissionHistoryPage;