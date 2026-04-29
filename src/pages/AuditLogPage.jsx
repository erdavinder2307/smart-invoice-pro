import React, { useCallback, useEffect, useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";

import { useAuth } from "../context/AuthContext";
import { getAuditLogs, getAuditLogDetailData } from "../services/auditLogService";
import { useTranslation } from "react-i18next";

// ── Helpers ───────────────────────────────────────────────────────────────────
const ACTION_COLORS = {
  CREATE: "success",
  UPDATE: "info",
  DELETE: "error",
  LOGIN: "default",
  LOGOUT: "default",
  PAYMENT: "warning",
};

const ACTION_LABELS = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
  LOGIN: "Login",
  LOGOUT: "Logout",
  PAYMENT: "Payment",
};

const ENTITY_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "invoice", label: "Invoice" },
  { value: "customer", label: "Customer" },
  { value: "payment", label: "Payment" },
  { value: "user", label: "User" },
];

const ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "CREATE", label: "Created" },
  { value: "UPDATE", label: "Updated" },
  { value: "DELETE", label: "Deleted" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "PAYMENT", label: "Payment" },
];

/**
 * Return an array of { field, before, after } for keys that changed.
 */
function computeDiff(before, after) {
  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);
  return Array.from(allKeys)
    .filter(
      (k) =>
        JSON.stringify((before || {})[k]) !== JSON.stringify((after || {})[k])
    )
    .map((k) => ({
      field: k,
      before: (before || {})[k],
      after: (after || {})[k],
    }));
}

function formatValue(v) {
  if (v === undefined || v === null) return <em style={{ color: "#aaa" }}>—</em>;
  if (typeof v === "object") return <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(v, null, 2)}</pre>;
  return String(v);
}

// ── Detail dialog ─────────────────────────────────────────────────────────────
function AuditDetailDialog({ log, onClose }) {
  if (!log) return null;
  const normalized = getAuditLogDetailData(log);
  const diff = computeDiff(normalized.before, normalized.after);
  const hasBefore = !!normalized.before;
  const hasAfter = !!normalized.after;
  const action = String(log.action || "").toUpperCase();

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Chip
            label={ACTION_LABELS[action] ?? action}
            color={ACTION_COLORS[action] ?? "default"}
            size="small"
            sx={{ mr: 1, fontWeight: 600, textTransform: "capitalize" }}
          />
          <Typography component="span" variant="subtitle1" fontWeight={600}>
            {normalized.entity} — {log.entity_id}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          {normalized.created_at ? new Date(normalized.created_at).toLocaleString() : ""}
          {log.user_id ? ` · by ${log.user_id}` : ""}
        </Typography>

        {action === "CREATE" && hasAfter && (
          <>
            <Typography variant="subtitle2" gutterBottom>Created record</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell><b>Field</b></TableCell>
                    <TableCell><b>Value</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(normalized.after).map(([field, value]) => (
                    <TableRow key={field}>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: 13 }}>{field}</TableCell>
                      <TableCell sx={{ wordBreak: "break-all" }}>{formatValue(value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {action === "DELETE" && hasBefore && (
          <>
            <Typography variant="subtitle2" gutterBottom>Deleted record (snapshot)</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#fbe9e7" }}>
                    <TableCell><b>Field</b></TableCell>
                    <TableCell><b>Value</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(normalized.before).map(([field, value]) => (
                    <TableRow key={field}>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: 13 }}>{field}</TableCell>
                      <TableCell sx={{ wordBreak: "break-all" }}>{formatValue(value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {action === "UPDATE" && (
          diff.length === 0 ? (
            <Alert severity="info">No field differences detected.</Alert>
          ) : (
            <>
              <Typography variant="subtitle2" gutterBottom>{diff.length} field(s) changed</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell><b>Field</b></TableCell>
                      <TableCell><b>Before</b></TableCell>
                      <TableCell><b>After</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diff.map(({ field, before, after }) => (
                      <TableRow key={field}>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: 13 }}>{field}</TableCell>
                        <TableCell sx={{ bgcolor: "#ffebee", wordBreak: "break-all" }}>{formatValue(before)}</TableCell>
                        <TableCell sx={{ bgcolor: "#e8f5e9", wordBreak: "break-all" }}>{formatValue(after)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AuditLogPage() {
  const { userRole } = useAuth();
  const { t } = useTranslation();
  const [logs, setLogs]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(0);
  const [rowsPerPage]         = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  // Filters
  const [entityType, setEntityType] = useState("");
  const [action, setAction]         = useState("");
  const [fromDate, setFromDate]     = useState("");
  const [toDate, setToDate]         = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: rowsPerPage };
      if (entityType) params.entity_type = entityType;
      if (action)     params.action      = action;
      if (fromDate)   params.from_date   = fromDate;
      if (toDate)     params.to_date     = toDate;

      const result = await getAuditLogs(params);
      setLogs(result.logs ?? []);
      setTotal(result.total ?? 0);
    } catch (err) {
      setError(t('auditLog.failedFetch'));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, entityType, action, fromDate, toDate, t]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  if (userRole && userRole !== "Admin") {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Box>
            <Alert severity="error">{t('auditLog.accessDenied')}</Alert>
          </Box>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box flex={1} minWidth={0}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <HistoryIcon sx={{ mr: 1, color: "text.secondary" }} />
            <Typography variant="h6" fontWeight={700}>{t('auditLog.title')}</Typography>
          </Box>

          {/* Filters */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <Select
              size="small"
              value={entityType}
              onChange={(e) => { setEntityType(e.target.value); setPage(0); }}
              displayEmpty
              sx={{ minWidth: 150 }}
            >
              {ENTITY_TYPE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>

            <Select
              size="small"
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(0); }}
              displayEmpty
              sx={{ minWidth: 140 }}
            >
              {ACTION_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>

            <TextField
              size="small"
              type="date"
              label="From"
              InputLabelProps={{ shrink: true }}
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
              sx={{ width: 160 }}
            />
            <TextField
              size="small"
              type="date"
              label="To"
              InputLabelProps={{ shrink: true }}
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(0); }}
              sx={{ width: 160 }}
            />
          </Paper>

          {/* Error */}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Table */}
          <Paper variant="outlined">
            <TableContainer sx={{ overflowX: "hidden" }}>
              <Table size="small" sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell><b>Date / Time</b></TableCell>
                    <TableCell><b>Action</b></TableCell>
                    <TableCell><b>Entity Type</b></TableCell>
                    <TableCell><b>Entity ID</b></TableCell>
                    <TableCell><b>User</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No audit log entries found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow
                        key={log.id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => setSelectedLog(log)}
                      >
                        <TableCell sx={{ whiteSpace: "nowrap", fontSize: 13 }}>
                          {(log.created_at || log.timestamp) ? new Date(log.created_at || log.timestamp).toLocaleString() : "—"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ACTION_LABELS[String(log.action || "").toUpperCase()] ?? log.action}
                            color={ACTION_COLORS[String(log.action || "").toUpperCase()] ?? "default"}
                            size="small"
                            sx={{ fontWeight: 600, textTransform: "capitalize", fontSize: 12 }}
                          />
                        </TableCell>
                        <TableCell sx={{ textTransform: "capitalize", fontSize: 13 }}>{log.entity || log.entity_type}</TableCell>
                        <TableCell>
                          <Tooltip title={log.entity_id ?? ""}>
                            <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: 12, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {log.entity_id}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ fontSize: 13 }}>
                          <Tooltip title={log.user_id ?? ""}>
                            <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: 12, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {log.user_id ?? "—"}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[50]}
              onPageChange={(_, newPage) => setPage(newPage)}
            />
          </Paper>
        </Box>
      </Box>

      {/* Detail Dialog */}
      {selectedLog && (
        <AuditDetailDialog log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </MainLayout>
  );
}
