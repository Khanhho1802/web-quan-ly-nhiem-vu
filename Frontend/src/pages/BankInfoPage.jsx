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

// ======= DANH SÁCH NGÂN HÀNG ĐÚNG Y FILE EXCEL =======
const BANK_LIST = [
  { value: "Ngoại thương Việt Nam (VCB)" },
  { value: "Công thương Việt Nam (Vietinbank - CTG)" },
  { value: "Đầu tư và Phát triển Việt Nam (BIDV)" },
  { value: "Kỹ thương Việt Nam (Techcombank - TCB)" },
  { value: "Quân đội (MB)" },
  { value: "Sài Gòn Thương Tín (Sacombank - STB)" },
  { value: "Á Châu (ACB)" },
  { value: "Việt Nam Thịnh Vượng (VPBank)" },
  { value: "Hàng Hải (MSB)" },
  { value: "Tiên Phong (TPBank)" },
  { value: "Sài Gòn - Hà Nội (SHB)" },
  { value: "Phát triển TP.HCM (HDBank)" },
  { value: "Xuất Nhập Khẩu Việt Nam (Eximbank)" },
  { value: "Bưu điện Liên Việt (LienVietPostBank)" },
  { value: "Quốc tế Việt Nam (VIB)" },
  { value: "Đông Nam Á (SeABank)" },
  { value: "Việt Á (VietABank)" },
  { value: "Bắc Á (BacABank)" },
  { value: "Sài Gòn (SCB)" },
  { value: "Nam Á (NamABank)" },
  { value: "Kiên Long (Kienlongbank)" },
  { value: "Đại Chúng Việt Nam (PVcomBank)" },
  { value: "Dầu Khí Toàn Cầu (GPBank)" },
  { value: "Xăng Dầu Petrolimex (PG Bank)" },
  { value: "Sài Gòn Công Thương (Saigonbank)" },
  { value: "Bản Việt (VietCapitalBank)" },
  { value: "An Bình (ABBANK)" },
  { value: "Xây Dựng Việt Nam (CBBank)" },
  { value: "Indovina (IVB)" },
  { value: "United Overseas Bank (UOB)" },
  { value: "Standard Chartered Việt Nam" },
  { value: "Public Bank Vietnam" },
  { value: "Woori Bank" },
  { value: "Shinhan Bank Việt Nam" },
  { value: "Hong Leong Bank" },
  { value: "CIMB Bank Việt Nam" },
  { value: "OCB (Phương Đông)" },
  { value: "VRB (Việt Nga)" },
  { value: "BNP Paribas Việt Nam" },
  { value: "HSBC Việt Nam" },
  { value: "Citibank Việt Nam" },
  { value: "Ngân hàng khác" }
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

  // Lịch sử thay đổi
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hasPending, setHasPending] = useState(false);

  // Lấy thông tin cá nhân và bank info lần đầu
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get("/auth/me/");
        setProfile(res.data);
        setBankInfo({
          account_holder: res.data.bank_account_holder_name || "",
          account_number: res.data.bank_account_number || "",
          bank_name: res.data.bank_name || "",
          bank_branch: res.data.bank_branch || ""
        });
      } catch (err) {
        setError("Không thể tải thông tin cá nhân. Vui lòng thử lại.");
      }
      setLoading(false);
    };
    fetchProfile();
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  // Lấy lịch sử yêu cầu đổi thông tin bank
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get("/finances/payment-info-requests/");
      setHistory(Array.isArray(res.data) ? res.data : []);
      setHasPending(res.data?.some((row) => row.status === "pending"));
    } catch {
      setHistory([]);
      setHasPending(false);
    }
    setHistoryLoading(false);
  };

  // Xác định thông tin đã được duyệt hay chưa
  const isApproved = useMemo(() => {
    if (!profile || !profile.bank_account_number) return false;
    return history.some(
      (row) =>
        row.status === "approved" &&
        row.requested_account_holder_name === profile.bank_account_holder_name &&
        row.requested_account_number === profile.bank_account_number &&
        row.requested_bank_name === profile.bank_name &&
        row.requested_bank_branch === profile.bank_branch
    );
  }, [history, profile]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setBankInfo({ ...bankInfo, [e.target.name]: e.target.value });
  };

  // Kiểm tra có đủ trường không
  const isFilled =
    bankInfo.account_holder.trim() &&
    bankInfo.account_number.trim() &&
    bankInfo.bank_name.trim() &&
    bankInfo.bank_branch.trim();

  // Submit tạo mới/sửa: LUÔN gửi yêu cầu chờ duyệt
  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!isFilled) {
      setError("Vui lòng nhập đầy đủ thông tin ngân hàng.");
      return;
    }
    try {
      await api.post("/finances/payment-info-requests/", {
        requested_account_holder_name: bankInfo.account_holder,
        requested_account_number: bankInfo.account_number,
        requested_bank_name: bankInfo.bank_name,
        requested_bank_branch: bankInfo.bank_branch
      });
      setSuccess("Đã gửi yêu cầu. Vui lòng chờ admin duyệt!");
      setSnackbar({ open: true, message: "Đã gửi yêu cầu đổi thông tin.", severity: "success" });
      setEditMode(false);
      setHasPending(true);
      fetchHistory();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Không thể gửi yêu cầu đổi thông tin ngân hàng."
      );
      setSnackbar({ open: true, message: "Lỗi: Không thể gửi yêu cầu!", severity: "error" });
    }
  };

  // Bắt đầu sửa lại
  const handleEdit = () => {
    setEditMode(true);
    setError("");
    setSuccess("");
  };

  // Hủy chỉnh sửa
  const handleCancel = () => {
    setEditMode(false);
    setBankInfo({
      account_holder: profile.bank_account_holder_name || "",
      account_number: profile.bank_account_number || "",
      bank_name: profile.bank_name || "",
      bank_branch: profile.bank_branch || ""
    });
    setError("");
    setSuccess("");
  };

  if (loading) return <Box sx={{ textAlign: "center", mt: 4 }}><CircularProgress /></Box>;
  if (!profile) return <Alert severity="error" sx={{ mt: 2 }}>Không có dữ liệu user.</Alert>;

  // Làm mờ/xám khi đã duyệt
  const infoStyle = isApproved
    ? { opacity: 0.55, pointerEvents: "none", userSelect: "none" }
    : {};

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Thông tin ngân hàng
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {isApproved && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Thông tin ngân hàng này đã được admin duyệt và đang áp dụng!
          </Alert>
        )}
        {(!profile.bank_account_number || editMode) ? (
          <Stack spacing={2}>
            <TextField
              label="Chủ tài khoản"
              name="account_holder"
              value={bankInfo.account_holder}
              onChange={handleChange}
              fullWidth
              disabled={hasPending}
            />
            <TextField
              label="Số tài khoản"
              name="account_number"
              value={bankInfo.account_number}
              onChange={handleChange}
              fullWidth
              disabled={hasPending}
            />
            <FormControl fullWidth>
              <InputLabel>Ngân hàng</InputLabel>
              <Select
                name="bank_name"
                label="Ngân hàng"
                value={bankInfo.bank_name}
                onChange={handleChange}
                disabled={hasPending}
                MenuProps={{
                  PaperProps: { style: { maxHeight: 350 } }
                }}
              >
                {BANK_LIST.map((bank) => (
                  <MenuItem key={bank.value} value={bank.value}>
                    {bank.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Chi nhánh"
              name="bank_branch"
              value={bankInfo.bank_branch}
              onChange={handleChange}
              fullWidth
              disabled={hasPending}
            />
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!isFilled || hasPending}
                sx={{ mr: 2 }}
              >
                Gửi yêu cầu lưu thông tin
              </Button>
              {profile.bank_account_number && (
                <Button variant="outlined" onClick={handleCancel}>Hủy</Button>
              )}
            </Box>
          </Stack>
        ) : (
          <Box sx={infoStyle}>
            <Typography><b>Chủ tài khoản:</b> {profile.bank_account_holder_name}</Typography>
            <Typography><b>Số tài khoản:</b> {profile.bank_account_number}</Typography>
            <Typography><b>Ngân hàng:</b> {profile.bank_name}</Typography>
            <Typography><b>Chi nhánh:</b> {profile.bank_branch}</Typography>
          </Box>
        )}
        {/* Nút Chỉnh sửa luôn hiện rõ, không bị mờ */}
        {!editMode && profile.bank_account_number && (
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={handleEdit}
            disabled={hasPending}
          >
            Chỉnh sửa
          </Button>
        )}
        {hasPending && !editMode && (
          <Alert severity="info" sx={{ mt: 2 }}>Bạn đang có yêu cầu đổi thông tin đang chờ duyệt.</Alert>
        )}
      </Paper>
      {/* Lịch sử các yêu cầu đổi */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Lịch sử các yêu cầu đổi thông tin ngân hàng</Typography>
        {historyLoading ? (
          <CircularProgress />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ngày gửi</TableCell>
                  <TableCell>Chủ TK</TableCell>
                  <TableCell>Số TK</TableCell>
                  <TableCell>Ngân hàng</TableCell>
                  <TableCell>Chi nhánh</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày duyệt</TableCell>
                  <TableCell>Lý do từ chối</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history && history.length > 0 ? history.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.requested_at ? new Date(row.requested_at).toLocaleString() : "-"}</TableCell>
                    <TableCell>{row.requested_account_holder_name}</TableCell>
                    <TableCell>{row.requested_account_number}</TableCell>
                    <TableCell>{row.requested_bank_name}</TableCell>
                    <TableCell>{row.requested_bank_branch}</TableCell>
                    <TableCell>
                      {row.status === "pending" && <span style={{ color: '#e6b800' }}>Chờ duyệt</span>}
                      {row.status === "approved" && <span style={{ color: '#15803d' }}>Đã duyệt</span>}
                      {row.status === "rejected" && <span style={{ color: '#d32f2f' }}>Từ chối</span>}
                    </TableCell>
                    <TableCell>{row.reviewed_at ? new Date(row.reviewed_at).toLocaleString() : "-"}</TableCell>
                    <TableCell>{row.rejection_reason || ""}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">Không có yêu cầu nào.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      {/* Snackbar thông báo */}
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
    </Box>
  );
};

export default BankInfoPage;
