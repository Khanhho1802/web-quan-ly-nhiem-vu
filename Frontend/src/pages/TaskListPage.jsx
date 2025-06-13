// Đường dẫn: frontend/src/pages/TaskListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { Box, Typography, CircularProgress, Alert, List, ListItemText, Paper, ListItemButton } from '@mui/material';
import api from '../services/api';

const TaskListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks/');
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Danh sách nhiệm vụ
      </Typography>
      <Paper>
        <List>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              // THAY ĐỔI Ở ĐÂY: Sử dụng `task.task_id` thay vì `task.id`
              <ListItemButton key={task.task_id} component={Link} to={`/task/${task.task_id}`}>
                <ListItemText 
                  primary={task.title} 
                  secondary={task.description || 'Không có mô tả'} 
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