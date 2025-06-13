// Đường dẫn: frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Paper, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Lấy action 'login' từ store
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Chỉ cần gọi một action 'login' duy nhất
            const user = await login(username, password);
            
            // Kiểm tra vai trò và điều hướng
            if (user && user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/tasks');
            }

        } catch (err) {
            console.error('Login failed:', err);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Tên đăng nhập hoặc mật khẩu không đúng.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Đăng nhập
                </Typography>
                {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Tên đăng nhập"
                        name="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Mật khẩu"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                    <Typography variant="body2" align="center">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            Đăng ký tại đây
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}