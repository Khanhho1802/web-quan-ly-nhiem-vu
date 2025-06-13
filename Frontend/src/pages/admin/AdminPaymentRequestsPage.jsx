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
  Tooltip
} from "@mui/material";
import { CheckCircle, Cancel, Info } from "@mui/icons-material";
import api from "../../services/api";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" }
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/admin/payment-requests/";
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await api.get(url);
      // === FIX: Lấy từ results ===
      setRequests(Array.isArray(res.data.results) ? res.data.results : []);
    } catch (err) {
      setError("Lỗi tải danh sách yêu cầu đổi thông tin.");
      setRequests([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [statusFilter]);

  // Table paging
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Actions
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.post(`/admin/payment-requests/${selectedRequest.id}/approve/`);
      setSnackbar({ open: true, message: "Duyệt và cập nhật thông tin thành công!", severity: "success" });
      setSelectedRequest(null);
      fetchData();
    } catch (e) {
      setSnackbar({ open: true, message: "Duyệt thất bại.", severity: "error" });
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setSnackbar({ open: true, message: "Vui lòng nhập lý do từ chối.", severity: "warning" });
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/admin/payment-requests/${selectedRequest.id}/reject/`, { rejection_reason: rejectionReason });
      setSnackbar({ open: true, message: "Đã từ chối yêu cầu.", severity: "success" });
      setSelectedRequest(null);
      setRejectionReason("");
      fetchData();
    } catch (e) {
      setSnackbar({ open: true, message: "Từ chối thất bại.", severity: "error" });
    }
    setActionLoading(false);
  };

  // UI
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" color="primary" mb={2}>
        Duyệt Đổi Thông Tin Thanh Toán
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box display="flex" alignItems="center" mb={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 180, mr: 2 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={statusFilter}
            label="Trạng thái"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          onClick={fetchData}
        >
          Làm mới
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ maxHeight: 540 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Người dùng</TableCell>
              <TableCell>Thông tin cũ</TableCell>
              <TableCell>Thông tin yêu cầu thay đổi</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày gửi</TableCell>
              <TableCell>Ngày duyệt</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : Array.isArray(requests) && requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Không có yêu cầu nào.
                </TableCell>
              </TableRow>
            ) : Array.isArray(requests) ? (
              requests
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      {row.user?.username}<br />
                      <Typography variant="caption">{row.user?.email}</Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "pre-line" }}>
                      <b>Chủ TK:</b> {row.user?.bank_account_holder_name || "-"}<br />
                      <b>Số TK:</b> {row.user?.bank_account_number || "-"}<br />
                      <b>Ngân hàng:</b> {row.user?.bank_name || "-"}<br />
                      <b>Chi nhánh:</b> {row.user?.bank_branch || "-"}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "pre-line" }}>
                      <b>Chủ TK:</b> {row.requested_account_holder_name}<br />
                      <b>Số TK:</b> {row.requested_account_number}<br />
                      <b>Ngân hàng:</b> {row.requested_bank_name}<br />
                      <b>Chi nhánh:</b> {row.requested_bank_branch}
                    </TableCell>
                    <TableCell>
                      <strong>
                        {
                          {
                            pending: "Chờ duyệt",
                            approved: "Đã duyệt",
                            rejected: "Từ chối"
                          }[row.status] || row.status
                        }
                      </strong>
                    </TableCell>
                    <TableCell>{row.requested_at ? new Date(row.requested_at).toLocaleString() : "-"}</TableCell>
                    <TableCell>{row.reviewed_at ? new Date(row.reviewed_at).toLocaleString() : "-"}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Chi tiết / Duyệt / Từ chối">
                        <IconButton color="primary" onClick={() => setSelectedRequest(row)}>
                          <Info />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ color: 'red' }}>
                  Dữ liệu API không hợp lệ!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={Array.isArray(requests) ? requests.length : 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số dòng/trang"
      />

      {/* Modal chi tiết / duyệt / từ chối */}
      <Dialog open={!!selectedRequest} onClose={() => setSelectedRequest(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Yêu cầu thay đổi thông tin #{selectedRequest?.id}
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box>
              <Typography>
                <b>Người dùng:</b> {selectedRequest.user?.username} ({selectedRequest.user?.email})
              </Typography>
              <Typography sx={{ mt: 1 }}><b>Trạng thái:</b> {selectedRequest.status}</Typography>
              <Typography sx={{ mt: 2 }}><b>Thông tin hiện tại:</b></Typography>
              <Typography variant="body2" sx={{ ml: 2, whiteSpace: "pre-line" }}>
                Chủ TK: {selectedRequest.user?.bank_account_holder_name || "-"}<br />
                Số TK: {selectedRequest.user?.bank_account_number || "-"}<br />
                Ngân hàng: {selectedRequest.user?.bank_name || "-"}<br />
                Chi nhánh: {selectedRequest.user?.bank_branch || "-"}
              </Typography>
              <Typography sx={{ mt: 2 }}><b>Thông tin đề xuất thay đổi:</b></Typography>
              <Typography variant="body2" sx={{ ml: 2, whiteSpace: "pre-line" }}>
                Chủ TK: {selectedRequest.requested_account_holder_name}<br />
                Số TK: {selectedRequest.requested_account_number}<br />
                Ngân hàng: {selectedRequest.requested_bank_name}<br />
                Chi nhánh: {selectedRequest.requested_bank_branch}
              </Typography>
              {selectedRequest.status === "rejected" && selectedRequest.rejection_reason && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <b>Lý do từ chối:</b> {selectedRequest.rejection_reason}
                </Alert>
              )}
            </Box>
          )}
          {selectedRequest && selectedRequest.status === "pending" && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <b>Lưu ý:</b> Chỉ duyệt khi thông tin hợp lệ. Nếu từ chối, bạn phải nhập lý do rõ ràng.
            </Alert>
          )}
          {selectedRequest && selectedRequest.status === "pending" && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Lý do từ chối (nếu có):</Typography>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                style={{ width: "100%", minHeight: 56, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontFamily: 'inherit' }}
                placeholder="Nhập lý do từ chối (bắt buộc nếu muốn từ chối)"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRequest(null)} disabled={actionLoading}>Đóng</Button>
          {selectedRequest?.status === "pending" && (
            <>
              <Button
                variant="contained"
                color="error"
                onClick={handleReject}
                disabled={actionLoading}
              >
                Từ chối
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                Duyệt & cập nhật
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
          sx={{ minWidth: 200 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AdminPaymentRequestsPage;
