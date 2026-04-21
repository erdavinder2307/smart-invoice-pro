import React, { useCallback, useEffect, useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import axios from "axios";

import { C, fieldSx } from "../components/common/formStyles";
import { createApiUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";
import {
  getSettingsUsers,
  inviteUser,
  updateSettingsUser,
  deactivateUser,
  getRoles,
} from "../services/rolesService";

const ROLE_COLORS = {
  Admin: "error",
  Manager: "warning",
  Accountant: "info",
  Sales: "success",
  Purchaser: "secondary",
};

const EMPTY_INVITE = { name: "", email: "", username: "", password: "", role_id: "" };
const EMPTY_EDIT   = { role_id: "", role: "" };

function avatarInitials(name, username) {
  const src = name || username || "?";
  return src.charAt(0).toUpperCase();
}
function avatarColor(str) {
  const palette = ["#1976d2","#388e3c","#f57c00","#7b1fa2","#c62828","#0097a7","#5d4037"];
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffff;
  return palette[Math.abs(h) % palette.length];
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function UserManagement() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers]           = useState([]);
  const [roles, setRoles]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [toast, setToast]           = useState({ open: false, message: "", severity: "success" });

  // Invite dialog
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState(EMPTY_INVITE);
  const [inviting, setInviting]     = useState(false);
  const [inviteErr, setInviteErr]   = useState("");

  // Edit role dialog
  const [editOpen, setEditOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm]     = useState(EMPTY_EDIT);
  const [saving, setSaving]         = useState(false);

  // Deactivate confirm
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const showToast = (message, severity = "success") =>
    setToast({ open: true, message, severity });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [usersData, rolesData] = await Promise.all([
        getSettingsUsers(),
        getRoles(),
      ]);
      setUsers(usersData.users || usersData);
      setRoles(rolesData.roles || rolesData);
    } catch {
      // Fallback to legacy endpoint
      try {
        const res = await axios.get(createApiUrl("/api/users"), { headers: { "X-User-Id": user?.id } });
        setUsers(res.data);
      } catch {
        setError("Failed to load users.");
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Invite ──────────────────────────────────────────────────────────────────
  const handleInviteSubmit = async () => {
    if (!inviteForm.username.trim() || !inviteForm.password.trim()) {
      setInviteErr("Username and password are required.");
      return;
    }
    setInviting(true);
    setInviteErr("");
    try {
      await inviteUser(inviteForm);
      setInviteOpen(false);
      showToast("User invited successfully.");
      fetchData();
    } catch (err) {
      setInviteErr(err.response?.data?.error || "Failed to invite user.");
    } finally {
      setInviting(false);
    }
  };

  // ── Edit role ───────────────────────────────────────────────────────────────
  const openEdit = (u) => {
    setEditTarget(u);
    setEditForm({ role_id: u.role_id || "", role: u.role || "" });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      if (editForm.role_id) {
        await updateSettingsUser(editTarget.id, { role_id: editForm.role_id });
      } else if (editForm.role) {
        await axios.put(
          createApiUrl(`/api/users/${editTarget.id}/role`),
          { role: editForm.role },
          { headers: { "X-User-Id": user?.id } }
        );
      }
      setEditOpen(false);
      showToast("Role updated.");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update role.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Deactivate/Activate ──────────────────────────────────────────────────────
  const handleToggleActive = async () => {
    setConfirmOpen(false);
    try {
      if (confirmTarget.is_active === false) {
        await updateSettingsUser(confirmTarget.id, { is_active: true });
        showToast(`${confirmTarget.username} reactivated.`);
      } else {
        await deactivateUser(confirmTarget.id);
        showToast(`${confirmTarget.username} deactivated.`);
      }
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || "Operation failed.", "error");
    }
  };

  // ── Role label helper ────────────────────────────────────────────────────────
  const getRoleLabel = (u) => {
    if (u.role_id && roles.length) {
      const r = roles.find((r) => r.id === u.role_id);
      if (r) return r.name;
    }
    return u.role || "—";
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <Box sx={{ p: 3, bgcolor: C.pageBg, minHeight: "calc(100vh - 64px)" }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1rem", color: C.label }}>
                User Management
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: C.hint, mt: 0.25 }}>
                Manage team members and their access roles.
              </Typography>
            </Box>
            {isAdmin && (
              <Button variant="contained" size="small" startIcon={<PersonAddIcon />}
                onClick={() => { setInviteForm(EMPTY_INVITE); setInviteErr(""); setInviteOpen(true); }}
                sx={{ textTransform: "none", fontSize: "0.8125rem" }}>
                Invite User
              </Button>
            )}
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress size={32} /></Box>
          ) : (
            <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: "4px", bgcolor: C.white }}>
              <TableContainer sx={{ overflowX: "hidden" }}>
                <Table size="small" sx={{ tableLayout: "fixed" }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: C.sectionBg, "& th": { fontWeight: 600, fontSize: "0.75rem", color: C.hint, borderBottom: `1px solid ${C.border}` } }}>
                      <TableCell sx={{ pl: 2 }}>User</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Member Since</TableCell>
                      {isAdmin && <TableCell align="right" sx={{ pr: 2 }}>Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u) => {
                      const isSelf   = u.id === user?.id;
                      const isActive = u.is_active !== false;
                      const roleLabel = getRoleLabel(u);
                      return (
                        <TableRow key={u.id}
                          sx={{ "&:last-child td": { border: 0 }, opacity: isActive ? 1 : 0.55, "& td": { fontSize: "0.8125rem", py: 1.25 } }}>
                          <TableCell sx={{ pl: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: "0.8125rem", bgcolor: avatarColor(u.username) }}>
                                {avatarInitials(u.name, u.username)}
                              </Avatar>
                              <Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500, color: C.label }}>
                                    {u.name || u.username}
                                  </Typography>
                                  {isSelf && (
                                    <Chip label="You" size="small" variant="outlined"
                                      sx={{ height: 16, fontSize: "0.65rem", "& .MuiChip-label": { px: 0.75 } }} />
                                  )}
                                </Box>
                                <Typography sx={{ fontSize: "0.75rem", color: C.hint }}>
                                  {u.email || u.username}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={roleLabel} color={ROLE_COLORS[roleLabel] || "default"}
                              size="small" sx={{ fontSize: "0.75rem", height: 22 }} />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={isActive ? "Active" : "Inactive"}
                              color={isActive ? "success" : "default"}
                              size="small"
                              variant={isActive ? "filled" : "outlined"}
                              sx={{ fontSize: "0.75rem", height: 22 }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: C.hint }}>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                          </TableCell>
                          {isAdmin && (
                            <TableCell align="right" sx={{ pr: 2 }}>
                              <Tooltip title="Edit role">
                                <IconButton size="small" onClick={() => openEdit(u)}>
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              {!isSelf && (
                                <Tooltip title={isActive ? "Deactivate" : "Activate"}>
                                  <IconButton size="small" color={isActive ? "default" : "success"}
                                    onClick={() => { setConfirmTarget(u); setConfirmOpen(true); }}>
                                    {isActive ? <BlockIcon sx={{ fontSize: 16 }} /> : <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 5 : 4} align="center" sx={{ py: 4, color: C.hint }}>
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
      </Box>
          </Box>

      {/* ── Invite Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "0.9375rem", fontWeight: 700, pb: 1 }}>Invite User</DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {inviteErr && <Alert severity="error">{inviteErr}</Alert>}
          <TextField label="Name"      size="small" fullWidth value={inviteForm.name}
            onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))} sx={fieldSx} />
          <TextField label="Email"     size="small" fullWidth type="email" value={inviteForm.email}
            onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))} sx={fieldSx} />
          <TextField label="Username *" size="small" fullWidth value={inviteForm.username}
            onChange={(e) => setInviteForm((f) => ({ ...f, username: e.target.value }))} sx={fieldSx} />
          <TextField label="Password *" size="small" fullWidth type="password" value={inviteForm.password}
            onChange={(e) => setInviteForm((f) => ({ ...f, password: e.target.value }))} sx={fieldSx} />
          <TextField label="Role" size="small" fullWidth select value={inviteForm.role_id}
            onChange={(e) => setInviteForm((f) => ({ ...f, role_id: e.target.value }))} sx={fieldSx}>
            {roles.map((r) => (
              <MenuItem key={r.id} value={r.id} sx={{ fontSize: "0.875rem" }}>{r.name}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button size="small" onClick={() => setInviteOpen(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button size="small" variant="contained" onClick={handleInviteSubmit} disabled={inviting} sx={{ textTransform: "none" }}>
            {inviting ? "Inviting…" : "Invite"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Role Dialog ────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "0.9375rem", fontWeight: 700, pb: 1 }}>
          Edit Role — {editTarget?.name || editTarget?.username}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {roles.length > 0 ? (
            <TextField label="Role" size="small" fullWidth select value={editForm.role_id}
              onChange={(e) => setEditForm((f) => ({ ...f, role_id: e.target.value }))} sx={fieldSx}>
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.id} sx={{ fontSize: "0.875rem" }}>
                  {r.name}{r.is_system ? " (System)" : ""}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField label="Role" size="small" fullWidth select value={editForm.role}
              onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))} sx={fieldSx}>
              {["Admin", "Manager", "Sales", "Accountant", "Purchaser"].map((r) => (
                <MenuItem key={r} value={r} sx={{ fontSize: "0.875rem" }}>{r}</MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button size="small" onClick={() => setEditOpen(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button size="small" variant="contained" onClick={handleEditSave} disabled={saving} sx={{ textTransform: "none" }}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Confirm Toggle ───────────────────────────────────────────────────── */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "0.9375rem", fontWeight: 700 }}>
          {confirmTarget?.is_active === false ? "Activate User" : "Deactivate User"}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.875rem" }}>
            {confirmTarget?.is_active === false
              ? `Reactivate ${confirmTarget?.name || confirmTarget?.username}? They will regain access.`
              : `Deactivate ${confirmTarget?.name || confirmTarget?.username}? They will lose access immediately.`
            }
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button size="small" onClick={() => setConfirmOpen(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button size="small" variant="contained"
            color={confirmTarget?.is_active === false ? "success" : "error"}
            onClick={handleToggleActive} sx={{ textTransform: "none" }}>
            {confirmTarget?.is_active === false ? "Activate" : "Deactivate"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      <Snackbar open={toast.open} autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setToast((t) => ({ ...t, open: false }))} severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
