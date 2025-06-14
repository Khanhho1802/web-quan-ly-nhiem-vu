import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Snackbar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from "@mui/material";
import api from "../services/api";

const BANK_LIST = [
  { value: "Quân đội (MB)" },
  { value: "Công Thương Việt Nam (VIETINBANK)" },
  { value: "Đầu tư và phát triển (BIDV)" },
  { value: "Nông nghiệp và Phát triển nông thôn (VBA)" },
  { value: "Ngoại thương Việt Nam (VCB)" },
  // ... thêm ngân hàng khác nếu cần
];

const BankInfoPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    account_holder: "",
    account_number: "",
    bank_name: "",
    bank_branch: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/me/");
        setProfile(res.data);
        setBankInfo({
          account_holder: res.data.bank_account_holder_name || "",
          account_number: res.data.bank_account_number || "",
          bank_name: res.data.bank_name || "",
          bank_branch: res.data.bank_branch || ""
        });
      } catch {
        setError("Không thể tải thông tin cá nhân.");
      }
      setLoading(false);
    };

    fetchProfile();
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get("/users/payment-info-requests/");
      setHistory(Array.isArray(res.data.results) ? res.data.results : res.data); // fallback
      setHasPending(
        res.data.results?.some((row) => row.status === "pending") || false
      );
    } catch {
      setHistory([]);
      setHasPending(false);
    }
    setHistoryLoading(false);
  };

  // ✅ Logic so sánh thông tin profile với yêu cầu đã được duyệt
  const isApproved = useMemo(() => {
    if (!profile || !history.length) return false;
    const approvedRequest = history.find((r) => r.status === "approved");
    if (!approvedRequest) return false;

    return (
      approvedRequest.requested_account_holder_name === profile.bank_account_holder_name &&
      approvedRequest.requested_account_number === profile.bank_account_number &&
      approvedRequest.requested_bank_name === profile.bank_name &&
      approvedRequest.requested_bank_branch === profile.bank_branch
    );
  }, [history, profile]);

  const handleChange = (e) => {
    setBankInfo({ ...bankInfo, [e.target.name]: e.target.value });
  };

  const isFilled = Object.values(bankInfo).every((v) => v.trim());

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!isFilled) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    try {
      await api.post("/users/payment-info-requests/", {
        requested_account_holder_name: bankInfo.account_holder,
        requested_account_number: bankInfo.account_number,
        requested_bank_name: bankInfo.bank_name,
        requested_bank_branch: bankInfo.bank_branch
      });
      setSuccess("Đã gửi yêu cầu.");
      setSnackbar({ open: true, message: "Yêu cầu đã được gửi.", severity: "success" });
      setEditMode(false);
      setHasPending(true);
      fetchHistory();
    } catch (err) {
      const msg = err?.response?.data?.detail || "Không thể gửi yêu cầu.";
      setError(msg);
      setSnackbar({ open: true, message: `Lỗi: ${msg}`, severity: "error" });
    }
  };

  const handleEdit = () => setEditMode(true);

  const handleCancel = () => {
    setEditMode(false);
    if (profile) {
      setBankInfo({
        account_holder: profile.bank_account_holder_name || "",
        account_number: profile.bank_account_number || "",
        bank_name: profile.bank_name || "",
        bank_branch: profile.bank_branch || ""
      });
    }
  };

  if (loading) return <Box sx={{ textAlign: "center", mt: 4 }}><CircularProgress /></Box>;
  if (!profile) return <Alert severity="error">Không có dữ liệu người dùng.</Alert>;

  const infoStyle = isApproved ? { opacity: 0.6, userSelect: "none" } : {};

  return (
    <Box maxWidth={800} mx="auto" mt={4}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Thông tin ngân hàng</Typography>
        <Divider sx={{ mb: 2 }} />

        {isApproved && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Thông tin ngân hàng này đã được admin duyệt và đang được áp dụng.
          </Alert>
        )}

        {(editMode || !profile.bank_account_number) ? (
          <Stack spacing={2}>
            <TextField label="Chủ tài khoản" name="account_holder" value={bankInfo.account_holder} onChange={handleChange} fullWidth />
            <TextField label="Số tài khoản" name="account_number" value={bankInfo.account_number} onChange={handleChange} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Ngân hàng</InputLabel>
              <Select name="bank_name" label="Ngân hàng" value={bankInfo.bank_name} onChange={handleChange}>
                {BANK_LIST.map((b) => (
                  <MenuItem key={b.value} value={b.value}>{b.value}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Chi nhánh" name="bank_branch" value={bankInfo.bank_branch} onChange={handleChange} fullWidth />
            {error && <Alert severity="error">{error}</Alert>}
            <Box>
              <Button variant="contained" onClick={handleSubmit} sx={{ mr: 2 }}>Gửi yêu cầu</Button>
              {profile.bank_account_number && <Button variant="outlined" onClick={handleCancel}>Hủy</Button>}
            </Box>
          </Stack>
        ) : (
          <Box>
            <Box sx={infoStyle}>
              <Typography><b>Chủ tài khoản:</b> {profile.bank_account_holder_name}</Typography>
              <Typography><b>Số tài khoản:</b> {profile.bank_account_number}</Typography>
              <Typography><b>Ngân hàng:</b> {profile.bank_name}</Typography>
              <Typography><b>Chi nhánh:</b> {profile.bank_branch}</Typography>
            </Box>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={handleEdit}>
              Chỉnh sửa
            </Button>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>Lịch sử yêu cầu đổi thông tin</Typography>
        {historyLoading ? (
          <CircularProgress />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ngày gửi</TableCell>
                  <TableCell>Thông tin yêu cầu</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày duyệt</TableCell>
                  <TableCell>Lý do từ chối</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length > 0 ? history.map((row) => (
                  <TableRow key={row.request_id}>
                    <TableCell>{row.requested_at ? new Date(row.requested_at).toLocaleString('vi-VN') : "-"}</TableCell>
                    <TableCell>
                      <Typography variant="caption"><b>Chủ TK:</b> {row.requested_account_holder_name}</Typography><br />
                      <Typography variant="caption"><b>Số TK:</b> {row.requested_account_number}</Typography><br />
                      <Typography variant="caption"><b>NH:</b> {row.requested_bank_name}</Typography><br />
                      <Typography variant="caption"><b>CN:</b> {row.requested_bank_branch}</Typography>
                    </TableCell>
                    <TableCell>
                      <span style={{ fontWeight: 'bold', color: row.status === 'pending' ? '#e6b800' : row.status === 'approved' ? '#15803d' : '#d32f2f' }}>
                        { { pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối" }[row.status] }
                      </span>
                    </TableCell>
                    <TableCell>{row.reviewed_at ? new Date(row.reviewed_at).toLocaleString('vi-VN') : "-"}</TableCell>
                    <TableCell>{row.rejection_reason || "-"}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Không có yêu cầu nào.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BankInfoPage;
