import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TablePagination,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Snackbar,
  Divider,
  Tooltip,
  TextField,
} from "@mui/material";
import { CheckCircle, Cancel, Info } from "@mui/icons-material";
import api from "../../services/api";

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
  { value: "all", label: "Tất cả" },
];

const AdminPaymentRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // SỬA LỖI: Thêm state để quản lý phân trang từ server
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      // SỬA LỖI: Gửi thông số page và page_size lên cho backend
      params.append('page', page + 1); // DRF page bắt đầu từ 1, MUI page bắt đầu từ 0
      params.append('page_size', rowsPerPage);

      const url = `/users/admin/payment-requests/?${params.toString()}`;
      const res = await api.get(url);
      
      // SỬA LỖI: Đọc mảng từ res.data.results và tổng số lượng từ res.data.count
      setRequests(Array.isArray(res.data.results) ? res.data.results : []);
      setTotalCount(res.data.count || 0);

    } catch (err) {
      setError("Lỗi khi tải danh sách yêu cầu. Vui lòng thử lại.");
      setRequests([]);
      setTotalCount(0);
    }
    setLoading(false);
  };

  // SỬA LỖI: useEffect sẽ chạy lại khi filter, page, hoặc rowsPerPage thay đổi
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [statusFilter, page, rowsPerPage]);

  // Table paging
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset về trang đầu tiên khi đổi số dòng
  };

  // Actions
  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await api.post(`/users/admin/payment-requests/${selectedRequest.request_id}/approve/`);
      setSnackbar({ open: true, message: "Duyệt và cập nhật thông tin thành công!", severity: "success" });
      setSelectedRequest(null);
      fetchData(); // Tải lại dữ liệu
    } catch (e) {
      setSnackbar({ open: true, message: "Duyệt thất bại.", severity: "error" });
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      setSnackbar({ open: true, message: "Vui lòng nhập lý do từ chối.", severity: "warning" });
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/users/admin/payment-requests/${selectedRequest.request_id}/reject/`, { rejection_reason: rejectionReason });
      setSnackbar({ open: true, message: "Đã từ chối yêu cầu.", severity: "success" });
      setSelectedRequest(null);
      setRejectionReason("");
      fetchData(); // Tải lại dữ liệu
    } catch (e) {
      setSnackbar({ open: true, message: "Từ chối thất bại.", severity: "error" });
    }
    setActionLoading(false);
  };

  return (
    <Paper sx={{ p: 3, m: 2, overflow: 'hidden' }}>
      <Typography variant="h4" color="primary" mb={2}>
        Duyệt Đổi Thông Tin Thanh Toán
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <FormControl size="small" sx={{ minWidth: 180, mb: 2 }}>
        <InputLabel>Trạng thái</InputLabel>
        <Select
          value={statusFilter}
          label="Trạng thái"
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} // Reset page khi đổi filter
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Người dùng</TableCell>
              <TableCell>Thông tin Yêu cầu</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày gửi</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>
            ) : requests.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">Không có yêu cầu nào.</TableCell></TableRow>
            ) : (
              requests.map((row) => (
                <TableRow hover key={row.request_id}>
                  <TableCell>{row.request_id}</TableCell>
                  <TableCell>
                    {row.user?.username}<br />
                    <Typography variant="caption" color="text.secondary">{row.user?.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" component="div"><b>Chủ TK:</b> {row.requested_account_holder_name}</Typography>
                    <Typography variant="body2" component="div"><b>Số TK:</b> {row.requested_account_number}</Typography>
                    <Typography variant="body2" component="div"><b>Ngân hàng:</b> {row.requested_bank_name}</Typography>
                    <Typography variant="body2" component="div"><b>Chi nhánh:</b> {row.requested_bank_branch}</Typography>
                  </TableCell>
                  <TableCell>
                    <strong style={{ color: row.status === 'pending' ? 'orange' : row.status === 'approved' ? 'green' : 'red' }}>
                        { { pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối" }[row.status] || row.status }
                    </strong>
                  </TableCell>
                  <TableCell>{row.requested_at ? new Date(row.requested_at).toLocaleString('vi-VN') : "-"}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Xem chi tiết & Duyệt">
                      <IconButton color="primary" onClick={() => setSelectedRequest(row)}>
                        <Info />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        // SỬA LỖI: Dùng totalCount từ API cho việc đếm
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số dòng/trang"
      />

      <Dialog open={!!selectedRequest} onClose={() => setSelectedRequest(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết Yêu cầu #{selectedRequest?.request_id}</DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box>
                <Typography><b>Người dùng:</b> {selectedRequest.user?.username} ({selectedRequest.user?.email})</Typography>
                <Typography sx={{ mt: 1 }}><b>Trạng thái:</b> {selectedRequest.status}</Typography>
                <Divider sx={{ my: 2 }}/>
                <Typography variant="h6">Thông tin đề xuất thay đổi</Typography>
                <Typography sx={{ ml: 2, whiteSpace: "pre-line" }}>
                    <b>Chủ TK:</b> {selectedRequest.requested_account_holder_name}<br />
                    <b>Số TK:</b> {selectedRequest.requested_account_number}<br />
                    <b>Ngân hàng:</b> {selectedRequest.requested_bank_name}<br />
                    <b>Chi nhánh:</b> {selectedRequest.requested_bank_branch}
                </Typography>
                {selectedRequest.status === 'pending' && (
                    <TextField
                        label="Lý do từ chối (bắt buộc nếu từ chối)"
                        fullWidth
                        multiline
                        rows={3}
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        variant="outlined"
                        margin="normal"
                    />
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={() => { setSelectedRequest(null); setRejectionReason(''); }} disabled={actionLoading}>Đóng</Button>
          {selectedRequest?.status === "pending" && (
            <Box>
              <Button variant="contained" color="error" onClick={handleReject} disabled={actionLoading || !rejectionReason.trim()} sx={{ mr: 1 }}>
                Từ chối
              </Button>
              <Button variant="contained" color="success" onClick={handleApprove} disabled={actionLoading}>
                Duyệt & cập nhật
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AdminPaymentRequestsPage;