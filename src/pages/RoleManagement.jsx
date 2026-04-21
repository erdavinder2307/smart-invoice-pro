import React, { useCallback, useEffect, useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { C, fieldSx } from "../components/common/formStyles";
import { useAuth } from "../context/AuthContext";
import { PERMISSION_MODULES, MODULE_LABELS } from "../context/PermissionContext";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../services/rolesService";
const ACTIONS = ["view", "create", "edit", "delete"];
const ACTION_LABELS = { view: "View", create: "Create", edit: "Edit", delete: "Delete" };

// Build a blank permissions map: all false
function blankPermissions() {
  const p = {};
  Object.keys(PERMISSION_MODULES).forEach((mod) => {
    p[mod] = {};
    PERMISSION_MODULES[mod].forEach((action) => { p[mod][action] = false; });
  });
  return p;
}
// ── Permission Matrix ─────────────────────────────────────────────────────────
function PermissionMatrix({ permissions, onChange, readOnly }) {
  const moduleKeys = Object.keys(PERMISSION_MODULES);

  const toggle = (mod, action) => {
    if (readOnly) return;
    const updated = {
      ...permissions,
      [mod]: { ...permissions[mod], [action]: !permissions[mod]?.[action] },
    };
    onChange(updated);
  };

  // "Select all" for a module row
  const toggleAllInRow = (mod) => {
    if (readOnly) return;
    const actions = PERMISSION_MODULES[mod];
    const allOn = actions.every((a) => permissions[mod]?.[a]);
    const updated = { ...permissions, [mod]: {} };
    actions.forEach((a) => { updated[mod][a] = !allOn; });
    onChange(updated);
  };

  return (
    <TableContainer sx={{ border: `1px solid ${C.border}`, borderRadius: "4px", mt: 1 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow sx={{ "& th": { bgcolor: C.sectionBg, fontWeight: 600, fontSize: "0.75rem", color: C.hint, borderBottom: `1px solid ${C.border}` } }}>
            <TableCell sx={{ minWidth: 160 }}>Module</TableCell>
            {ACTIONS.map((a) => (
              <TableCell key={a} align="center" sx={{ minWidth: 72 }}>{ACTION_LABELS[a]}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {moduleKeys.map((mod) => {
            const actions = PERMISSION_MODULES[mod];
            return (
              <TableRow key={mod} hover sx={{ "& td": { fontSize: "0.8125rem", py: 0.5 } }}>
                <TableCell>
                  <Typography
                    sx={{ fontSize: "0.8125rem", fontWeight: 500, cursor: readOnly ? "default" : "pointer", color: C.label }}
                    onClick={() => toggleAllInRow(mod)}
                  >
                    {MODULE_LABELS[mod] || mod}
                  </Typography>
                </TableCell>
                {ACTIONS.map((action) => {
                  const supported = actions.includes(action);
                  const checked   = Boolean(permissions[mod]?.[action]);
                  return (
                    <TableCell key={action} align="center" sx={{ py: 0.25 }}>
                      {supported ? (
                        <Checkbox
                          size="small"
                          checked={checked}
                          disabled={readOnly}
                          onChange={() => toggle(mod, action)}
                          sx={{ p: 0.5, "&.Mui-checked": { color: C.primary } }}
                        />
                      ) : (
                        <Typography sx={{ color: C.hint, fontSize: "1rem", lineHeight: 1 }}>—</Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RoleManagement() {
  const { isAdmin } = useAuth();
  const [roles, setRoles]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [toast, setToast]     = useState({ open: false, message: "", severity: "success" });

  // Create role dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [creating, setCreating]       = useState(false);
  const [createErr, setCreateErr]     = useState("");

  // Edit (permission matrix) dialog
  const [editOpen, setEditOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editPerms, setEditPerms]   = useState({});
  const [editName, setEditName]     = useState("");
  const [saving, setSaving]         = useState(false);

  // Delete confirm
  const [deleteOpen, setDeleteOpen]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getRoles();
      setRoles(data.roles || data);
    } catch {
      setError("Failed to load roles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const showToast = (message, severity = "success") =>
    setToast({ open: true, message, severity });

  // ── Create role ─────────────────────────────────────────────────────────────
  const openCreate = () => { setNewRoleName(""); setCreateErr(""); setCreateOpen(true); };

  const handleCreate = async () => {
    if (!newRoleName.trim()) { setCreateErr("Name is required."); return; }
    setCreating(true);
    setCreateErr("");
    try {
      await createRole({ name: newRoleName.trim(), permissions: blankPermissions() });
      setCreateOpen(false);
      showToast("Role created.");
      fetchRoles();
    } catch (err) {
      setCreateErr(err.response?.data?.error || "Failed to create role.");
    } finally {
      setCreating(false);
    }
  };

  // ── Edit permissions ────────────────────────────────────────────────────────
  const openEdit = (role) => {
    setEditTarget(role);
    setEditName(role.name);
    // Merge stored permissions with blank template so all modules are present
    const merged = blankPermissions();
    if (role.permissions) {
      Object.keys(role.permissions).forEach((mod) => {
        if (merged[mod]) {
          Object.keys(role.permissions[mod]).forEach((a) => {
            if (merged[mod][a] !== undefined) merged[mod][a] = role.permissions[mod][a];
          });
        }
      });
    }
    setEditPerms(merged);
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { permissions: editPerms };
      if (!editTarget.is_system) payload.name = editName;
      await updateRole(editTarget.id, payload);
      setEditOpen(false);
      showToast("Role updated.");
      fetchRoles();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update role.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete role ─────────────────────────────────────────────────────────────
  const openDelete = (role) => { setDeleteTarget(role); setDeleteOpen(true); };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRole(deleteTarget.id);
      setDeleteOpen(false);
      showToast("Role deleted.");
      fetchRoles();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to delete role.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <Box sx={{ p: 3, bgcolor: C.pageBg, minHeight: "calc(100vh - 64px)" }}>
        <Box sx={{ minWidth: 0 }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1rem", color: C.label }}>
                Roles
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: C.hint, mt: 0.25 }}>
                Define roles and control what each role can access.
              </Typography>
            </Box>
            {isAdmin && (
              <Button
                variant="contained" size="small"
                startIcon={<AddIcon />}
                onClick={openCreate}
                sx={{ textTransform: "none", fontSize: "0.8125rem" }}
              >
                New Role
              </Button>
            )}
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress size={32} /></Box>
          ) : (
            <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: "4px", bgcolor: C.white }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: C.sectionBg, "& th": { fontWeight: 600, fontSize: "0.75rem", color: C.hint, borderBottom: `1px solid ${C.border}` } }}>
                      <TableCell sx={{ pl: 2 }}>Role Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Modules with Access</TableCell>
                      {isAdmin && <TableCell align="right" sx={{ pr: 2 }}>Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.map((role) => {
                      const permCount = Object.keys(role.permissions || {}).filter(
                        (m) => Object.values(role.permissions[m] || {}).some(Boolean)
                      ).length;
                      return (
                        <TableRow key={role.id} sx={{ "&:last-child td": { border: 0 }, "& td": { fontSize: "0.8125rem", py: 1.25 } }}>
                          <TableCell sx={{ pl: 2 }}>
                            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: C.label }}>
                              {role.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={role.is_system ? "System" : "Custom"}
                              size="small"
                              color={role.is_system ? "primary" : "default"}
                              variant={role.is_system ? "filled" : "outlined"}
                              sx={{ fontSize: "0.75rem", height: 22 }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: C.hint }}>
                            {permCount} / {Object.keys(PERMISSION_MODULES).length} modules
                          </TableCell>
                          {isAdmin && (
                            <TableCell align="right" sx={{ pr: 2 }}>
                              <Tooltip title="Edit permissions">
                                <IconButton size="small" onClick={() => openEdit(role)}>
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              {!role.is_system && (
                                <Tooltip title="Delete role">
                                  <IconButton size="small" color="error" onClick={() => openDelete(role)}>
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                    {roles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 4 : 3} align="center" sx={{ py: 4, color: C.hint }}>
                          No roles found.
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

      {/* ── Create Role Dialog ──────────────────────────────────────── */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "0.9375rem", fontWeight: 700, pb: 1 }}>New Role</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {createErr && <Alert severity="error" sx={{ mb: 1.5 }}>{createErr}</Alert>}
          <TextField
            label="Role name"
            size="small"
            fullWidth
            autoFocus
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            sx={fieldSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button size="small" onClick={() => setCreateOpen(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button size="small" variant="contained" onClick={handleCreate} disabled={creating} sx={{ textTransform: "none" }}>
            {creating ? "Creating…" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Permissions Dialog ─────────────────────────────────── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: "0.9375rem", fontWeight: 700, pb: 1 }}>
          Edit Role — {editTarget?.name}
          {editTarget?.is_system && (
            <Chip label="System" size="small" color="primary" sx={{ ml: 1.5, fontSize: "0.7rem", height: 20 }} />
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 1.5 }}>
          {!editTarget?.is_system && (
            <TextField
              label="Role name"
              size="small"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              sx={{ ...fieldSx, mb: 2, maxWidth: 300 }}
            />
          )}
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: C.label, mb: 0.5 }}>
            Permission Matrix
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: C.hint, mb: 1 }}>
            Click a module name to toggle all its permissions at once.
          </Typography>
          <PermissionMatrix
            permissions={editPerms}
            onChange={setEditPerms}
            readOnly={false}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button size="small" onClick={() => setEditOpen(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button size="small" variant="contained" onClick={handleSave} disabled={saving} sx={{ textTransform: "none" }}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm ──────────────────────────────────────────── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "0.9375rem", fontWeight: 700 }}>Delete Role</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.875rem" }}>
            Delete <strong>{deleteTarget?.name}</strong>? Users assigned this role will be unassigned. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button size="small" onClick={() => setDeleteOpen(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button size="small" variant="contained" color="error" onClick={handleDelete} disabled={deleting} sx={{ textTransform: "none" }}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ───────────────────────────────────────────────────── */}
      <Snackbar open={toast.open} autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
