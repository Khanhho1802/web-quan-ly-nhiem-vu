// Đường dẫn: frontend/src/pages/admin/AdminExcelUploadPage.jsx

import React, { useState, useRef } from 'react'; // <<< THAY ĐỔI 1: Import thêm useRef
import { Box, Typography, Button, Paper, Alert, CircularProgress } from '@mui/material';
import api from '../../services/api';

const AdminExcelUploadPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // <<< THAY ĐỔI 2: Tạo một ref để tham chiếu đến thẻ input file >>>
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        // Lấy file đầu tiên từ danh sách được chọn
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setMessage('');
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Vui lòng chọn một file để tải lên.');
            return;
        }

        setUploading(true);
        setError('');
        setMessage('');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await api.post('/submissions/admin/excel-upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setMessage(response.data.message || 'Tải file lên và xử lý thành công!');
            setError(''); // Xóa lỗi cũ nếu có
        } catch (err) {
            console.error("Lỗi khi tải file excel:", err.response?.data);
            setError(err.response?.data?.error || 'Có lỗi xảy ra, không thể tải file lên.');
            setMessage(''); // Xóa thông báo thành công cũ nếu có
        } finally {
            setUploading(false);
            
            // <<< THAY ĐỔI 4: Reset state và giá trị của input sau khi hoàn tất >>>
            setSelectedFile(null); // Xóa file khỏi state để giao diện cập nhật
            if (fileInputRef.current) {
                fileInputRef.current.value = null; // Reset giá trị của thẻ input
            }
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Tải lên file Excel Đối soát</Typography>
            <Paper sx={{ p: 3 }}>
                <Typography sx={{ mb: 2 }}>
                    Chọn file .xlsx chứa danh sách mã vận đơn để hệ thống tự động đối soát và xử lý các bài nộp đã được duyệt.
                </Typography>
                <Box>
                    <Button variant="contained" component="label">
                        Chọn File
                        {/* <<< THAY ĐỔI 3: Gắn ref vào thẻ input >>> */}
                        <input 
                            type="file" 
                            hidden 
                            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                    </Button>
                    {selectedFile && <Typography sx={{ display: 'inline', ml: 2 }}>{selectedFile.name}</Typography>}
                </Box>
                
                <Box sx={{ mt: 3 }}>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleUpload} 
                        disabled={!selectedFile || uploading}
                    >
                        {uploading ? <CircularProgress size={24} color="inherit" /> : 'Tải lên'}
                    </Button>
                </Box>

                {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Paper>
        </Box>
    );
};

export default AdminExcelUploadPage;