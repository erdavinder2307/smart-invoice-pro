import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Button, Chip, CircularProgress, Container, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, InputAdornment, Paper,
  Snackbar, Alert, TextField, Tooltip, Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ComputerIcon from "@mui/icons-material/Computer";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import TabletIcon from "@mui/icons-material/Tablet";
import RefreshIcon from "@mui/icons-material/Refresh";
import LogoutIcon from "@mui/icons-material/Logout";
import MainLayout from "../components/Layout/MainLayout";
import { changePassword, getMeSessions, revokeSession } from "../services/meService";
import { C, ZohoRow, fieldSx, footerSx, saveBtnSx, cancelBtnSx } from "../components/common/formStyles";

function SectionHeader({ children, action }) {
  return (
    <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#333", textAlign: "left" }}>
        {children}
      </Typography>
      {action}
    </Box>
  );
}

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
};

const timeAgo = (iso) => {
  if (!iso) return "";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return "Active now";
    if (mins < 60) return `Active ${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Active ${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `Active ${days}d ago`;
    return `Active ${formatDate(iso)}`;
  } catch { return ""; }
};

const DeviceIcon = ({ deviceType }) => {
  const sx = { fontSize: 20 };
  if (deviceType === "Mobile") return <SmartphoneIcon sx={sx} />;
  if (deviceType === "Tablet") return <TabletIcon sx={sx} />;
  return <ComputerIcon sx={sx} />;
};

export default function SecurityPage() {
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);
  const [confirmRevoke, setConfirmRevoke] = useState(null);  // null | session_id | 'all'
  const [revokingAll, setRevokingAll] = useState(false);

  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwErrors, setPwErrors] = useState({});
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await getMeSessions();
      setSessions(data.sessions || []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleRevoke = async () => {
    if (!confirmRevoke) return;

    if (confirmRevoke === "all") {
      setRevokingAll(true);
      setConfirmRevoke(null);
      try {
        const others = sessions.filter((s) => !s.is_current);
        await Promise.all(others.map((s) => revokeSession(s.id)));
        setSessions((prev) => prev.filter((s) => s.is_current));
        setToast({ open: true, message: "All other sessions revoked", severity: "success" });
      } catch {
        setToast({ open: true, message: "Failed to revoke all sessions", severity: "error" });
      } finally {
        setRevokingAll(false);
      }
      return;
    }

    setRevoking(confirmRevoke);
    setConfirmRevoke(null);
    try {
      await revokeSession(confirmRevoke);
      setSessions((prev) => prev.filter((s) => s.id !== confirmRevoke));
      setToast({ open: true, message: "Session revoked", severity: "success" });
    } catch {
      setToast({ open: true, message: "Failed to revoke session", severity: "error" });
    } finally {
      setRevoking(null);
    }
  };

  const validatePw = () => {
    const errors = {};
    if (!pwForm.current_password) errors.current_password = "Current password is required";
    if (!pwForm.new_password) errors.new_password = "New password is required";
    else if (pwForm.new_password.length < 8) errors.new_password = "Minimum 8 characters";
    if (pwForm.new_password !== pwForm.confirm_password) errors.confirm_password = "Passwords do not match";
    return errors;
  };

  const handleChangePassword = async () => {
    const errors = validatePw();
    setPwErrors(errors);
    if (Object.keys(errors).length) return;
    setPwSaving(true);
    try {
      await changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
      setToast({ open: true, message: "Password changed successfully", severity: "success" });
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to change password";
      setToast({ open: true, message: msg, severity: "error" });
    } finally {
      setPwSaving(false);
    }
  };

  const toggleVis = (field) => setShowPw((p) => ({ ...p, [field]: !p[field] }));

  const endAdornment = (field) => (
    <InputAdornment position="end">
      <IconButton size="small" onClick={() => toggleVis(field)} edge="end" tabIndex={-1}>
        {showPw[field]
          ? <VisibilityOffIcon sx={{ fontSize: 18 }} />
          : <VisibilityIcon sx={{ fontSize: 18 }} />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <MainLayout title="Security">
      <Box sx={{ bgcolor: C.pageBg, minHeight: "100vh", pb: 6 }}>
        <Container maxWidth={false} sx={{ pt: 3, px: 2.5 }}>
          <Box sx={{ minWidth: 0 }}>

            {/* ── Change Password ─────────────────────────────────────── */}
            <Paper
              elevation={0}
              sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden" }}
            >
              <Box sx={{ px: 3 }}>
                <SectionHeader>Change Password</SectionHeader>

                <ZohoRow label="Current Password" required>
                  <TextField
                    size="small" fullWidth
                    type={showPw.current ? "text" : "password"}
                    value={pwForm.current_password}
                    onChange={(e) => { setPwForm((f) => ({ ...f, current_password: e.target.value })); setPwErrors((er) => ({ ...er, current_password: "" })); }}
                    error={Boolean(pwErrors.current_password)}
                    helperText={pwErrors.current_password}
                    InputProps={{ endAdornment: endAdornment("current") }}
                    sx={fieldSx}
                  />
                </ZohoRow>

                <ZohoRow label="New Password" required hint="Minimum 8 characters">
                  <TextField
                    size="small" fullWidth
                    type={showPw.next ? "text" : "password"}
                    value={pwForm.new_password}
                    onChange={(e) => { setPwForm((f) => ({ ...f, new_password: e.target.value })); setPwErrors((er) => ({ ...er, new_password: "" })); }}
                    error={Boolean(pwErrors.new_password)}
                    helperText={pwErrors.new_password}
                    InputProps={{ endAdornment: endAdornment("next") }}
                    sx={fieldSx}
                  />
                </ZohoRow>

                <ZohoRow label="Confirm Password" required noDivider>
                  <TextField
                    size="small" fullWidth
                    type={showPw.confirm ? "text" : "password"}
                    value={pwForm.confirm_password}
                    onChange={(e) => { setPwForm((f) => ({ ...f, confirm_password: e.target.value })); setPwErrors((er) => ({ ...er, confirm_password: "" })); }}
                    error={Boolean(pwErrors.confirm_password)}
                    helperText={pwErrors.confirm_password}
                    InputProps={{ endAdornment: endAdornment("confirm") }}
                    sx={fieldSx}
                  />
                </ZohoRow>
              </Box>

              <Box sx={footerSx}>
                <Button
                  variant="contained"
                  onClick={handleChangePassword}
                  disabled={pwSaving}
                  startIcon={pwSaving ? <CircularProgress size={14} color="inherit" /> : <LockOutlinedIcon sx={{ fontSize: 16 }} />}
                  sx={saveBtnSx}
                >
                  {pwSaving ? "Updating…" : "Update Password"}
                </Button>
              </Box>
            </Paper>

            {/* ── Active Sessions ─────────────────────────────────────── */}
            <Paper
              elevation={0}
              sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden", mt: 2.5 }}
            >
              <Box sx={{ px: 3 }}>
                <SectionHeader
                  action={
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      {sessions.filter((s) => !s.is_current).length > 0 && (
                        <Button
                          size="small"
                          startIcon={revokingAll ? <CircularProgress size={13} color="inherit" /> : <LogoutIcon sx={{ fontSize: 14 }} />}
                          onClick={() => setConfirmRevoke("all")}
                          disabled={revokingAll}
                          sx={{ textTransform: "none", fontSize: "0.8125rem", color: C.red, minWidth: 0, "&:hover": { color: "#b71c1c" } }}
                        >
                          Revoke others
                        </Button>
                      )}
                      <Button
                        size="small"
                        startIcon={<RefreshIcon sx={{ fontSize: 15 }} />}
                        onClick={fetchSessions}
                        sx={{ textTransform: "none", fontSize: "0.8125rem", color: C.hint, minWidth: 0, "&:hover": { color: C.label } }}
                      >
                        Refresh
                      </Button>
                    </Box>
                  }
                >
                  Active Sessions
                </SectionHeader>
              </Box>

              {sessionsLoading ? (
                <Box sx={{ px: 2.5, py: 3, display: "flex", justifyContent: "center" }}>
                  <CircularProgress size={24} />
                </Box>
              ) : sessions.length === 0 ? (
                <Box sx={{ px: 2.5, py: 2.5 }}>
                  <Typography sx={{ fontSize: "0.875rem", color: C.hint }}>No active sessions found.</Typography>
                </Box>
              ) : (
                sessions.map((session) => {
                  const displayName = session.device || (session.is_legacy ? "Legacy Session" : "Unknown Device");
                  const subLine = [
                    session.browser && session.browser_version ? `${session.browser} ${session.browser_version}` : session.browser,
                    session.os,
                  ].filter(Boolean).join(" · ");

                  return (
                    <Box
                      key={session.id}
                      sx={{
                        px: 2.5, py: 1.75,
                        borderTop: `1px solid ${C.divider}`,
                        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1,
                        bgcolor: session.is_current ? "#f8fffe" : "transparent",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                        <Box sx={{
                          color: session.is_current ? C.primary : C.hint,
                          mt: 0.2, flexShrink: 0,
                        }}>
                          <DeviceIcon deviceType={session.device_type} />
                        </Box>
                        <Box>
                          {/* Primary: device name e.g. "Chrome on macOS" */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: C.label }}>
                              {displayName}
                            </Typography>
                            {session.is_current && (
                              <Box sx={{
                                px: 0.75, py: "1px", borderRadius: "4px",
                                bgcolor: "#F0FDF4", color: "#16A34A",
                                border: "1px solid #BBF7D0",
                                fontSize: "0.6875rem", fontWeight: 700, lineHeight: 1.5,
                              }}>
                                Current
                              </Box>
                            )}
                            {session.is_legacy && (
                              <Box sx={{
                                px: 0.75, py: "1px", borderRadius: "4px",
                                bgcolor: "#FFF7ED", color: "#C2410C",
                                border: "1px solid #FED7AA",
                                fontSize: "0.6875rem", fontWeight: 600, lineHeight: 1.5,
                              }}>
                                Legacy
                              </Box>
                            )}
                          </Box>
                          {/* Secondary: browser version + OS */}
                          {subLine ? (
                            <Typography sx={{ fontSize: "0.8125rem", color: C.hint, mb: 0.1 }}>
                              {subLine}{session.ip_address ? ` · ${session.ip_address}` : ""}
                            </Typography>
                          ) : session.ip_address ? (
                            <Typography sx={{ fontSize: "0.8125rem", color: C.hint, mb: 0.1 }}>
                              {session.ip_address}
                            </Typography>
                          ) : null}
                          {/* Time */}
                          <Typography sx={{ fontSize: "0.75rem", color: C.hint }}>
                            {session.is_current
                              ? `Signed in ${formatDate(session.created_at)}`
                              : timeAgo(session.last_active_at)}
                          </Typography>
                        </Box>
                      </Box>
                      {!session.is_current && (
                        <Tooltip title="Revoke session">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setConfirmRevoke(session.id)}
                            disabled={revoking === session.id}
                            sx={{ mt: 0.25 }}
                          >
                            {revoking === session.id
                              ? <CircularProgress size={16} />
                              : <DeleteOutlineIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  );
                })
              )}
            </Paper>

            {/* ── Additional Security ─────────────────────────────────── */}
            <Paper
              elevation={0}
              sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden", mt: 2.5 }}
            >
              <Box sx={{ px: 3 }}>
                <SectionHeader>Additional Security</SectionHeader>
                {[
                  { label: "Two-Factor Authentication", desc: "Add a second layer of security to your account" },
                  { label: "Single Sign-On (SSO)",      desc: "Connect your organisation's identity provider" },
                ].map(({ label, desc }, idx, arr) => (
                  <Box
                    key={label}
                    sx={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      py: 1.5,
                      borderBottom: idx < arr.length - 1 ? `1px solid ${C.divider}` : "none",
                      opacity: 0.7,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: C.label }}>{label}</Typography>
                      <Typography sx={{ fontSize: "0.8125rem", color: C.hint }}>{desc}</Typography>
                    </Box>
                    <Chip
                      label="Roadmap"
                      size="small"
                      variant="outlined"
                      sx={{ height: 22, fontSize: "0.75rem", borderRadius: "4px" }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>

          </Box>
        </Container>
      </Box>

      {/* Revoke confirm dialog */}
      <Dialog
        open={Boolean(confirmRevoke)}
        onClose={() => setConfirmRevoke(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "4px" } }}
      >
        <DialogTitle sx={{ fontSize: "0.9375rem", fontWeight: 600, py: 1.5, px: 2.5, borderBottom: `1px solid ${C.divider}` }}>
          {confirmRevoke === "all" ? "Revoke All Other Sessions" : "Revoke Session"}
        </DialogTitle>
        <DialogContent sx={{ px: 2.5, py: 2 }}>
          <Typography sx={{ fontSize: "0.875rem", color: C.label }}>
            {confirmRevoke === "all"
              ? "This will sign out all other devices immediately. You will remain signed in on this device."
              : "Are you sure you want to revoke this session? The device will be signed out immediately."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${C.divider}` }}>
          <Button variant="outlined" onClick={() => setConfirmRevoke(null)} sx={cancelBtnSx}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRevoke}
            sx={{ ...saveBtnSx, bgcolor: C.red, "&:hover": { bgcolor: "#b71c1c" } }}
          >
            {confirmRevoke === "all" ? "Revoke All" : "Revoke"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}

