import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Paper, Grid, Button, Dialog, DialogActions, DialogContent, DialogContentText, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProfilePage = () => {
    const { user, setUser, fetchUser } = useAuthStore();

    const [open, setOpen] = useState(false);
    const [newCode, setNewCode] = useState('');
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');

    // ⚠️ Thêm để reload thông tin user khi quay lại từ BankInfoPage
    useEffect(() => {
        if (!user) {
            fetchUser();
        }
    }, [user, fetchUser]);

    const handleClickOpen = () => {
        setUpdateError('');
        setNewCode('');
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleUpdateCode = async () => {
        if (!newCode) {
            setUpdateError("Vui lòng nhập mã giới thiệu mới.");
            return;
        }
        setUpdating(true);
        setUpdateError('');
        try {
            const response = await api.patch('/auth/update-referral-code/', {
                new_referral_code: newCode
            });
            setUser(response.data);
            handleClose();
        } catch (err) {
            const errorData = err.response?.data;
            const errorMessage = errorData ? Object.values(errorData).flat().join(' ') : "Có lỗi xảy ra, vui lòng thử lại.";
            setUpdateError(errorMessage);
        } finally {
            setUpdating(false);
        }
    };

    if (!user) return <Typography>Đang tải thông tin người dùng...</Typography>;

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Hồ sơ cá nhân</Typography>
            <Paper sx={{ p: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><Typography variant="body1" color="text.secondary">Tên đăng nhập:</Typography><Typography variant="h6">{user.username}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography variant="body1" color="text.secondary">Email:</Typography><Typography variant="h6">{user.email}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography variant="body1" color="text.secondary">Số dư chính:</Typography><Typography variant="h6">{formatCurrency(user.balance)}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography variant="body1" color="text.secondary">Bậc (Tier Level):</Typography><Typography variant="h6">{user.tier_level}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography variant="body1" color="text.secondary">Tổng thu nhập từ nhiệm vụ:</Typography><Typography variant="h6" color="success.main">{formatCurrency(user.total_task_earnings)}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography variant="body1" color="text.secondary">Tổng thưởng từ giới thiệu:</Typography><Typography variant="h6" color="success.main">{formatCurrency(user.total_referral_bonuses)}</Typography></Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1" color="text.secondary">Mã giới thiệu của bạn:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{user.referral_code}</Typography>
                            {!user.has_edited_referral_code && (
                                <Button variant="outlined" size="small" onClick={handleClickOpen}>Thay đổi</Button>
                            )}
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            <b>Thông tin thanh toán:</b>{" "}
                            <Button component={Link} to="/profile/bank-info" variant="outlined" size="small">
                                Xem chi tiết / Cập nhật
                            </Button>
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <DialogContentText>Nhập mã giới thiệu mới của bạn.</DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        fullWidth
                        variant="standard"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                    />
                    {updateError && <Alert severity="error">{updateError}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Hủy</Button>
                    <Button onClick={handleUpdateCode} disabled={updating}>Cập nhật</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfilePage;
