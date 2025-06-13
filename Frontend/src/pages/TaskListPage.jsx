// Đường dẫn: frontend/src/pages/TaskListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Paper, ListItemButton } from '@mui/material';
import api from '../services/api';

const TaskListPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await api.get('/tasks/');
                // Xử lý cả trường hợp response có 'results' (do phân trang) hoặc không
                setTasks(response.data.results || response.data);
            } catch (err) {
                console.error("Lỗi khi tải danh sách nhiệm vụ:", err);
                setError("Không thể tải danh sách nhiệm vụ. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Đang tải danh sách nhiệm vụ...</Typography>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Danh sách nhiệm vụ
            </Typography>
            <Paper>
                <List>
                    {tasks.length > 0 ? (
                        tasks.map((task) => ( // Ở đây bạn đã dùng biến 'task' -> RẤT TỐT
                            <ListItemButton key={task.id} component={Link} to={`/tasks/${task.id}`}>
                                <ListItemText 
                                    primary={task.title} // Dùng 'task.title' -> ĐÚNG
                                    secondary={task.description || 'Không có mô tả'} // Dùng 'task.description' -> ĐÚNG
                                />
                            </ListItemButton>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="Không có nhiệm vụ nào." />
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Box>
    );
};

export default TaskListPage;