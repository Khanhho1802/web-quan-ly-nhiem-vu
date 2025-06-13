// Đường dẫn: frontend/src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Paper, Alert, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push("Phải có ít nhất 8 ký tự.");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("Phải chứa ít nhất một chữ cái viết hoa (A-Z).");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("Phải chứa ít nhất một chữ cái viết thường (a-z).");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("Phải chứa ít nhất một chữ số (0-9).");
    }
    return errors;
};


export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        referral_code: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
            setError(passwordErrors.join(' '));
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }
        
        setLoading(true);

        try {
            const payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            };

            // <<< THAY ĐỔI DUY NHẤT NẰM Ở ĐÂY >>>
            // Gửi mã giới thiệu với đúng tên trường mà backend mong muốn
            if (formData.referral_code) {
                payload.referrer_code = formData.referral_code;
            }
            
            await api.post('/auth/register/', payload);

            alert('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
            navigate('/login');

        } catch (err) {
            console.error('Registration failed:', err.response?.data);
            if (err.response?.data) {
                // Lấy lỗi từ backend (ví dụ: "Mã giới thiệu không hợp lệ.")
                const errorData = err.response.data;
                const errorMessages = Object.values(errorData).flat().join(' ');
                setError(errorMessages);
            } else {
                setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    const passwordValidationErrors = validatePassword(formData.password);

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Đăng ký tài khoản
                </Typography>

                {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField margin="normal" required fullWidth label="Tên đăng nhập" name="username" value={formData.username} onChange={handleChange} autoFocus />
                    <TextField margin="normal" required fullWidth label="Địa chỉ Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <TextField margin="normal" required fullWidth name="password" label="Mật khẩu" type="password" value={formData.password} onChange={handleChange} />
                    
                    {formData.password && (
                        <List dense>
                            <ListItem>
                                <ListItemIcon>
                                    {passwordValidationErrors.includes("Phải có ít nhất 8 ký tự.") ? <CancelIcon color="error" /> : <CheckCircleIcon color="success" />}
                                </ListItemIcon>
                                <ListItemText primary="Ít nhất 8 ký tự" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    {passwordValidationErrors.includes("Phải chứa ít nhất một chữ cái viết hoa (A-Z).") ? <CancelIcon color="error" /> : <CheckCircleIcon color="success" />}
                                </ListItemIcon>
                                <ListItemText primary="Ít nhất 1 chữ hoa" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    {passwordValidationErrors.includes("Phải chứa ít nhất một chữ cái viết thường (a-z).") ? <CancelIcon color="error" /> : <CheckCircleIcon color="success" />}
                                </ListItemIcon>
                                <ListItemText primary="Ít nhất 1 chữ thường" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    {passwordValidationErrors.includes("Phải chứa ít nhất một chữ số (0-9).") ? <CancelIcon color="error" /> : <CheckCircleIcon color="success" />}
                                </ListItemIcon>
                                <ListItemText primary="Ít nhất 1 chữ số" />
                            </ListItem>
                        </List>
                    )}

                    <TextField margin="normal" required fullWidth name="confirmPassword" label="Xác nhận Mật khẩu" type="password" value={formData.confirmPassword} onChange={handleChange} />
                    <TextField margin="normal" fullWidth label="Mã giới thiệu (Nếu có)" name="referral_code" value={formData.referral_code} onChange={handleChange} />
                    
                    <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, mb: 2 }}>
                        {loading ? 'Đang xử lý...' : 'Đăng ký'}
                    </Button>
                    <Typography variant="body2" align="center">
                        Đã có tài khoản?{' '}
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            Đăng nhập tại đây
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}