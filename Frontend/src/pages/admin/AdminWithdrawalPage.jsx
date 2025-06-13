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
  TextField,
  Alert,
  CircularProgress,
  Snackbar,
  Divider,
  Tooltip
} from "@mui/material";
import { CheckCircle, Cancel, DoneAll, CloudUpload } from "@mui/icons-material";
import api from "../../services/api";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
  { value: "completed", label: "Đã chuyển khoản" }
];

const AdminWithdrawalPage = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [batchDialog, setBatchDialog] = useState(false);
  const [batchFile, setBatchFile] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState(null);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/admin/withdrawal-requests/";
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await api.get(url);
      // Chỉ nhận array, nếu không sẽ set là []
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Lỗi tải danh sách rút tiền.");
      setRequests([]); // Luôn set là array để tránh lỗi .slice
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
      await api.post(`/admin/withdrawal-requests/${selectedRequest.id}/approve/`);
      setSnackbar({ open: true, message: "Đã duyệt lệnh rút tiền.", severity: "success" });
      setSelectedRequest(null);
      fetchData();
    } catch (e) {
      setSnackbar({ open: true, message: "Duyệt thất bại.", severity: "error" });
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      setSnackbar({ open: true, message: "Vui lòng nhập lý do từ chối.", severity: "warning" });
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/admin/withdrawal-requests/${selectedRequest.id}/reject/`, { notes: reason });
      setSnackbar({ open: true, message: "Đã từ chối và hoàn tiền.", severity: "success" });
      setSelectedRequest(null);
      setReason("");
      fetchData();
    } catch (e) {
      setSnackbar({ open: true, message: "Từ chối thất bại.", severity: "error" });
    }
    setActionLoading(false);
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await api.post(`/admin/withdrawal-requests/${selectedRequest.id}/complete/`);
      setSnackbar({ open: true, message: "Đã xác nhận chuyển khoản.", severity: "success" });
      setSelectedRequest(null);
      fetchData();
    } catch (e) {
      setSnackbar({ open: true, message: "Xác nhận chuyển khoản thất bại.", severity: "error" });
    }
    setActionLoading(false);
  };

  // Batch
  const handleBatchUpload = async () => {
    if (!batchFile) return;
    setBatchLoading(true);
    setBatchResult(null);
    const formData = new FormData();
    formData.append("file", batchFile);
    try {
      const res = await api.post("/admin/withdrawal-requests/batch-complete/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setBatchResult(res.data);
      setSnackbar({ open: true, message: "Xử lý file thành công.", severity: "success" });
      fetchData();
    } catch (e) {
      setBatchResult({ errors: ["File upload thất bại hoặc định dạng sai."] });
      setSnackbar({ open: true, message: "Xử lý file thất bại.", severity: "error" });
    }
    setBatchLoading(false);
    setBatchFile(null);
    setBatchDialog(false);
  };

  // UI
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" color="primary" mb={2}>
        Quản lý Rút tiền
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
          color="success"
          startIcon={<CloudUpload />}
          onClick={() => setBatchDialog(true)}
          sx={{ mr: 2 }}
        >
          Xử lý chuyển khoản hàng loạt (Excel)
        </Button>
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
              <TableCell>Mã lệnh</TableCell>
              <TableCell>Người yêu cầu</TableCell>
              <TableCell>Số tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Ngày xử lý</TableCell>
              <TableCell>Ghi chú Admin</TableCell>
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
                  Không có lệnh rút tiền nào.
                </TableCell>
              </TableRow>
            ) : Array.isArray(requests) ? (
              requests
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.id || row.request_id}>
                    <TableCell>{row.id || row.request_id}</TableCell>
                    <TableCell>
                      {row.user?.username || "?"}<br />
                      <Typography variant="caption">{row.user?.email}</Typography>
                    </TableCell>
                    <TableCell>{Number(row.amount).toLocaleString()} VNĐ</TableCell>
                    <TableCell>
                      <strong>
                        {
                          {
                            pending: "Chờ duyệt",
                            approved: "Đã duyệt",
                            rejected: "Từ chối",
                            completed: "Đã chuyển khoản"
                          }[row.status] || row.status
                        }
                      </strong>
                    </TableCell>
                    <TableCell>{row.requested_at ? new Date(row.requested_at).toLocaleString() : "-"}</TableCell>
                    <TableCell>{row.processed_at ? new Date(row.processed_at).toLocaleString() : "-"}</TableCell>
                    <TableCell sx={{ maxWidth: 160, whiteSpace: "pre-line" }}>
                      {row.admin_notes || row.rejection_reason || "-"}
                    </TableCell>
                    <TableCell align="center">
                      {row.status === "pending" && (
                        <>
                          <Tooltip title="Duyệt lệnh">
                            <IconButton color="success" onClick={() => setSelectedRequest(row)}>
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Từ chối & hoàn tiền">
                            <IconButton color="error" onClick={() => { setSelectedRequest(row); setReason(""); }}>
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {row.status === "approved" && (
                        <Tooltip title="Đã chuyển khoản thành công">
                          <IconButton color="primary" onClick={() => setSelectedRequest(row)}>
                            <DoneAll />
                          </IconButton>
                        </Tooltip>
                      )}
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

      {/* Modal duyệt/từ chối/complete */}
      <Dialog open={!!selectedRequest} onClose={() => setSelectedRequest(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {selectedRequest?.status === "pending"
            ? "Xử lý lệnh rút tiền"
            : selectedRequest?.status === "approved"
            ? "Xác nhận chuyển khoản"
            : "Chi tiết lệnh"}
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box>
              <Typography><b>Mã lệnh:</b> {selectedRequest.id || selectedRequest.request_id}</Typography>
              <Typography><b>Người yêu cầu:</b> {selectedRequest.user?.username}</Typography>
              <Typography><b>Email:</b> {selectedRequest.user?.email}</Typography>
              <Typography><b>Số tiền:</b> {Number(selectedRequest.amount).toLocaleString()} VNĐ</Typography>
              <Typography><b>Trạng thái:</b> {selectedRequest.status}</Typography>
              <Typography><b>Ngày tạo:</b> {selectedRequest.requested_at ? new Date(selectedRequest.requested_at).toLocaleString() : "-"}</Typography>
              <Typography><b>Ngày xử lý:</b> {selectedRequest.processed_at ? new Date(selectedRequest.processed_at).toLocaleString() : "-"}</Typography>
              {selectedRequest.admin_notes && (
                <Alert severity="info" sx={{ my: 1 }}>{selectedRequest.admin_notes}</Alert>
              )}
              {selectedRequest.status === "pending" && (
                <TextField
                  label="Lý do từ chối"
                  fullWidth
                  multiline
                  minRows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  sx={{ mt: 2 }}
                  placeholder="(Chỉ nhập khi từ chối)"
                />
              )}
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
                Từ chối & hoàn tiền
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                Duyệt lệnh
              </Button>
            </>
          )}
          {selectedRequest?.status === "approved" && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleComplete}
              disabled={actionLoading}
            >
              Xác nhận đã chuyển khoản
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog upload batch file */}
      <Dialog open={batchDialog} onClose={() => setBatchDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Xử lý chuyển khoản hàng loạt</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Tải lên file <b>.xlsx</b> chứa danh sách <b>request_id</b> đã được chuyển khoản. Hệ thống sẽ tự động cập nhật trạng thái “Đã chuyển khoản” cho các lệnh tương ứng.
          </Typography>
          <Box my={2}>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setBatchFile(e.target.files[0] || null)}
              style={{ marginTop: 12 }}
            />
          </Box>
          {batchResult && (
            <Box>
              <Alert severity="success" sx={{ my: 1 }}>
                Xử lý thành công: {batchResult.completed_ids?.length || 0} lệnh.
              </Alert>
              {batchResult.errors && batchResult.errors.length > 0 && (
                <Alert severity="warning" sx={{ whiteSpace: "pre-line", my: 1 }}>
                  {batchResult.errors.join("\n")}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDialog(false)} disabled={batchLoading}>Đóng</Button>
          <Button
            variant="contained"
            color="success"
            startIcon={batchLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
            onClick={handleBatchUpload}
            disabled={!batchFile || batchLoading}
          >
            {batchLoading ? "Đang xử lý..." : "Tải lên & cập nhật"}
          </Button>
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

export default AdminWithdrawalPage;
