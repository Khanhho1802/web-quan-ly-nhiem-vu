// Đường dẫn: frontend/src/pages/TaskDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Paper, TextField, Button, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import api from '../services/api';

const TaskDetailPage = () => {
    const { taskId } = useParams(); 
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // <<< THAY ĐỔI 1: Cập nhật state để xử lý nhiều ảnh >>>
    const [purchasePrice, setPurchasePrice] = useState('');
    const [trackingCode, setTrackingCode] = useState('');
    // State này giờ sẽ lưu một FileList (danh sách các file), thay vì một file duy nhất
    const [proofImages, setProofImages] = useState(null); 
    const [submitting, setSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState('');

    useEffect(() => {
        const fetchTaskDetail = async () => {
            try {
                const response = await api.get(`/tasks/${taskId}/`);
                setTask(response.data);
            } catch (err) {
                console.error("Lỗi khi tải chi tiết nhiệm vụ:", err);
                setError("Không thể tải chi tiết nhiệm vụ.");
            } finally {
                setLoading(false);
            }
        };

        fetchTaskDetail();
    }, [taskId]);

    // <<< THAY ĐỔI 2: Cập nhật hàm xử lý để nhận nhiều file >>>
    const handleImageChange = (event) => {
        // Lấy toàn bộ danh sách file người dùng chọn
        setProofImages(event.target.files);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setSubmissionError('');

        const formData = new FormData();
        formData.append('task', taskId);
        formData.append('purchase_price', purchasePrice);
        if (trackingCode) {
            formData.append('tracking_code', trackingCode);
        }

        // <<< THAY ĐỔI 3 (Quan trọng nhất): Cập nhật logic gửi file >>>
        // Kiểm tra xem người dùng có chọn file nào không
        if (proofImages && proofImages.length > 0) {
            // Lặp qua danh sách các file và append từng file vào FormData
            // với cùng một key là 'images_upload' để backend nhận được một mảng
            for (const file of proofImages) {
                formData.append('images_upload', file);
            }
        }
        
        try {
            await api.post('/submissions/', formData);
            
            alert('Nộp bằng chứng thành công!');
            navigate('/tasks');

        } catch (err) {
            console.error('Lỗi khi nộp bằng chứng:', err.response?.data);
            setSubmissionError('Nộp bằng chứng thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    if (!task) {
        return <Typography>Không tìm thấy nhiệm vụ.</Typography>;
    }

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h4" gutterBottom>{task.title}</Typography>
                <Typography variant="body1">{task.description}</Typography>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>Nộp bằng chứng</Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField 
                        margin="normal" 
                        fullWidth 
                        label="Giá mua" 
                        name="purchase_price" 
                        type="number" 
                        required 
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                    />
                    <TextField 
                        margin="normal" 
                        fullWidth 
                        label="Mã vận đơn" 
                        name="tracking_code" 
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                    />
                    
                    {/* <<< THAY ĐỔI 4: Cập nhật JSX để cho phép chọn nhiều file và hiển thị danh sách >>> */}
                    <Button variant="contained" component="label" sx={{ mt: 2 }}>
                        Tải ảnh bằng chứng
                        <input 
                            type="file" 
                            hidden 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            multiple // Thêm thuộc tính này để cho phép chọn nhiều file
                        />
                    </Button>
                    
                    {/* Hiển thị danh sách các file đã chọn */}
                    {proofImages && proofImages.length > 0 && (
                        <List dense>
                            {Array.from(proofImages).map((file, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon><ImageIcon /></ListItemIcon>
                                    <ListItemText primary={file.name} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                    
                    <Button type="submit" variant="contained" sx={{ mt: 2, display: 'block' }} disabled={submitting}>
                        {submitting ? 'Đang nộp...' : 'Nộp'}
                    </Button>
                    
                    {submissionError && <Alert severity="error" sx={{ mt: 2 }}>{submissionError}</Alert>}
                </Box>
            </Paper>
        </Box>
    );
};

export default TaskDetailPage;