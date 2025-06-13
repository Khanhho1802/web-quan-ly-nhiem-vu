// Đường dẫn: frontend/src/layouts/MainLayout.jsx

import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Box, Typography, Button, AppBar, Toolbar, Container } from '@mui/material'; // Sử dụng các component UI đẹp hơn


const MainLayout = () => {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <Box>
            {/* Thay thế header cũ bằng AppBar cho đẹp hơn */}
            <AppBar position="static">
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        <Typography
                            variant="h6"
                            noWrap
                            component={Link}
                            to="/tasks"
                            sx={{
                                mr: 2,
                                flexGrow: 1,
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.1rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            USER DASHBOARD
                        </Typography>

                        <Box sx={{ flexGrow: 0 }}>
                            <Button sx={{ my: 2, color: 'white', display: 'inline-block' }} component={Link} to="/tasks">Nhiệm vụ</Button>
                            
                            {/* <<< THAY ĐỔI DUY NHẤT Ở ĐÂY >>> */}
                            <Button sx={{ my: 2, color: 'white', display: 'inline-block' }} component={Link} to="/history">Nhiệm vụ đã thực hiện</Button>
                            
                            <Button sx={{ my: 2, color: 'white', display: 'inline-block' }} component={Link} to="/profile">Hồ sơ</Button>
                            <Button variant="outlined" color="inherit" size="small" onClick={handleLogout} sx={{ ml: 2 }}>
                                Đăng xuất
                            </Button>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            
            <Container component="main" sx={{ mt: 4, mb: 4 }}>
                <Outlet />
            </Container>
            
            <Box component="footer" sx={{ bgcolor: 'background.paper', p: 6 }} >
                <Typography variant="body2" color="text.secondary" align="center">
                    Đây là Footer chung.
                </Typography>
            </Box>
        </Box>
    );
};

export default MainLayout;