import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Grid, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [open, setOpen] = useState(false);
    const [newCode, setNewCode] = useState('');
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await api.get('/users/me/');
                setProfile(response.data);
            } catch (err) {
                setError("Không thể tải thông tin cá nhân. Vui lòng đảm bảo backend đang chạy và thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleClickOpen = () => {
        setUpdateError('');
        setNewCode('');
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleUpdateCode = async () => {
        if (!newCode) {
            setUpdateError("Vui lòng nhập mã giới thiệu mới.");
            return;
        }
        setUpdating(true);
        setUpdateError('');
        try {
            const response = await api.patch('/users/update-referral-code/', {
                new_referral_code: newCode
            });
            setProfile(response.data);
            handleClose();
        } catch (err) {
            const errorData = err.response?.data;
            const errorMessage = Object.values(errorData).flat().join(' ');
            setUpdateError(errorMessage || "Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    if (!profile) {
        return <Typography>Không tìm thấy thông tin.</Typography>;
    }

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Hồ sơ cá nhân
            </Typography>
            <Paper sx={{ p: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1" color="text.secondary">Tên đăng nhập:</Typography>
                        <Typography variant="h6">{profile.username}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1" color="text.secondary">Email:</Typography>
                        <Typography variant="h6">{profile.email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1" color="text.secondary">Số dư chính:</Typography>
                        <Typography variant="h6">{formatCurrency(profile.balance)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1" color="text.secondary">Bậc (Tier Level):</Typography>
                        <Typography variant="h6">{profile.tier_level}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1" color="text.secondary">Tổng thu nhập từ nhiệm vụ:</Typography>
                        <Typography variant="h6" color="success.main">{formatCurrency(profile.total_task_earnings)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1" color="text.secondary">Tổng thưởng từ giới thiệu:</Typography>
                        <Typography variant="h6" color="success.main">{formatCurrency(profile.total_referral_bonuses)}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1" color="text.secondary">Mã giới thiệu của bạn:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {profile.referral_code}
                            </Typography>
                            {!profile.has_edited_referral_code && (
                                <Button variant="outlined" size="small" onClick={handleClickOpen}>
                                    Thay đổi
                                </Button>
                            )}
                        </Box>
                    </Grid>
                    {/* Mục "Thông tin thanh toán" chuyển sang page mới */}
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
                <DialogTitle>Thay đổi mã giới thiệu</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Lưu ý: Bạn chỉ có thể thay đổi mã giới thiệu của mình một lần duy nhất.
                    </DialogContentText>
                    {updateError && <Alert severity="error" sx={{ mt: 1 }}>{updateError}</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="new_referral_code"
                        label="Mã giới thiệu mới"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Hủy</Button>
                    <Button onClick={handleUpdateCode} disabled={updating}>
                        {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfilePage;
