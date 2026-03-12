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
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import PersonIcon from "@mui/icons-material/Person";
import axios from "axios";
import { createApiUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";

// ── Role colours ──────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  Admin: "error",
  Manager: "warning",
  Accountant: "info",
  Sales: "success",
  Purchaser: "secondary",
};

const VALID_ROLES = ["Admin", "Manager", "Sales", "Accountant", "Purchaser"];

// ── Component ─────────────────────────────────────────────────────────────────
export default function UserManagement() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [savingId, setSavingId] = useState(null);

  const headers = { "X-User-Id": user?.id };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(createApiUrl("/api/users"), { headers });
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (targetUserId, newRole) => {
    setSavingId(targetUserId);
    try {
      await axios.put(
        createApiUrl(`/api/users/${targetUserId}/role`),
        { role: newRole },
        { headers }
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );
      setToast({ open: true, message: `Role updated to ${newRole}`, severity: "success" });
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.error || "Failed to update role.",
        severity: "error",
      });
    } finally {
      setSavingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <PersonIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              User Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage team members and their access roles.
            </Typography>
          </Box>
        </Box>

        {!isAdmin && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You have read-only access. Only Admins can change roles.
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={2}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: 700 } }}>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Member since</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow
                    key={u.id}
                    sx={{ "&:last-child td": { border: 0 } }}
                    selected={u.id === user?.id}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {u.username}
                        {u.id === user?.id && (
                          <Chip label="You" size="small" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{u.email || "—"}</TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Select
                          size="small"
                          value={u.role || "Sales"}
                          disabled={savingId === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          sx={{ minWidth: 140 }}
                        >
                          {VALID_ROLES.map((r) => (
                            <MenuItem key={r} value={r}>{r}</MenuItem>
                          ))}
                        </Select>
                      ) : (
                        <Chip
                          label={u.role || "Sales"}
                          color={ROLE_COLORS[u.role] || "default"}
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Toast */}
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
