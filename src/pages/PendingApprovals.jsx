import React, { useEffect, useState, useCallback } from "react";
import MainLayout from "../components/Layout/MainLayout";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { createApiUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";
import EmptyState from "../components/common/EmptyState";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (amount) =>
  `$${parseFloat(amount || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

// ── Component ─────────────────────────────────────────────────────────────────
export default function PendingApprovals() {
  const { user, canApprove } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // Reject dialog
  const [rejectDialog, setRejectDialog] = useState({
    open: false,
    id: null,
    type: null,      // "invoice" | "purchase_order"
    reason: "",
  });

  const headers = { "X-User-Id": user?.id };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(createApiUrl("/api/approvals/pending"), { headers });
      setInvoices(res.data.invoices || []);
      setPos(res.data.purchase_orders || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load pending approvals.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async (id, type) => {
    const url = type === "invoice"
      ? createApiUrl(`/api/invoices/${id}/approve`)
      : createApiUrl(`/api/purchase-orders/${id}/approve`);
    try {
      await axios.post(url, {}, { headers });
      setToast({ open: true, message: "Approved successfully.", severity: "success" });
      fetchPending();
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.error || "Approval failed.",
        severity: "error",
      });
    }
  };

  // ── Reject ─────────────────────────────────────────────────────────────────
  const openRejectDialog = (id, type) =>
    setRejectDialog({ open: true, id, type, reason: "" });

  const handleRejectConfirm = async () => {
    const { id, type, reason } = rejectDialog;
    const url = type === "invoice"
      ? createApiUrl(`/api/invoices/${id}/reject`)
      : createApiUrl(`/api/purchase-orders/${id}/reject`);
    try {
      await axios.post(url, { reason }, { headers });
      setToast({ open: true, message: "Rejected and returned to Draft.", severity: "info" });
      setRejectDialog((d) => ({ ...d, open: false }));
      fetchPending();
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.error || "Rejection failed.",
        severity: "error",
      });
    }
  };

  // ── Table row ──────────────────────────────────────────────────────────────
  const ApprovalRow = ({ item, type }) => (
    <TableRow>
      <TableCell>
        <Chip
          label={type === "invoice" ? "Invoice" : "Purchase Order"}
          size="small"
          color={type === "invoice" ? "primary" : "secondary"}
          variant="outlined"
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {type === "invoice" ? item.invoice_number : item.po_number}
        </Typography>
      </TableCell>
      <TableCell>
        {type === "invoice" ? item.customer_name : item.vendor_name}
      </TableCell>
      <TableCell align="right">{fmt(item.total_amount)}</TableCell>
      <TableCell>{fmtDate(item.submitted_at)}</TableCell>
      <TableCell align="right">
        {canApprove ? (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleApprove(item.id, type)}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => openRejectDialog(item.id, type)}
            >
              Reject
            </Button>
          </Stack>
        ) : (
          <Chip label="Awaiting Review" size="small" color="warning" />
        )}
      </TableCell>
    </TableRow>
  );

  const allItems = [
    ...invoices.map((i) => ({ ...i, _type: "invoice" })),
    ...pos.map((p) => ({ ...p, _type: "purchase_order" })),
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <HourglassEmptyIcon color="warning" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Pending Approvals
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Invoices and Purchase Orders awaiting review.
            </Typography>
          </Box>
          {!loading && (
            <Chip
              label={`${allItems.length} pending`}
              color={allItems.length > 0 ? "warning" : "default"}
              sx={{ ml: "auto" }}
            />
          )}
        </Box>

        {!canApprove && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You can submit items for approval but cannot approve or reject them.
            Managers and Admins handle approvals.
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : allItems.length === 0 ? (
          <Paper elevation={1} sx={{ overflow: 'hidden' }}>
            <EmptyState
              icon={<CheckCircleIcon sx={{ color: 'success.main' }} />}
              title="All caught up!"
              subtitle="No items are waiting for approval."
            />
          </Paper>
        ) : (
          <>
            {/* Invoices section */}
            {invoices.length > 0 && (
              <>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Invoices ({invoices.length})
                </Typography>
                <TableContainer component={Paper} elevation={2} sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: 700 } }}>
                        <TableCell>Type</TableCell>
                        <TableCell>Number</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell>Submitted</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoices.map((inv) => (
                        <ApprovalRow key={inv.id} item={inv} type="invoice" />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* Purchase Orders section */}
            {pos.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Purchase Orders ({pos.length})
                </Typography>
                <TableContainer component={Paper} elevation={2}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: 700 } }}>
                        <TableCell>Type</TableCell>
                        <TableCell>Number</TableCell>
                        <TableCell>Vendor</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell>Submitted</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pos.map((po) => (
                        <ApprovalRow key={po.id} item={po} type="purchase_order" />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        )}
      </Box>

      {/* ── Reject dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog((d) => ({ ...d, open: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject & Return to Draft</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason so the team knows what to fix.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection reason"
            value={rejectDialog.reason}
            onChange={(e) =>
              setRejectDialog((d) => ({ ...d, reason: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog((d) => ({ ...d, open: false }))}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectConfirm}
            disabled={!rejectDialog.reason.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
