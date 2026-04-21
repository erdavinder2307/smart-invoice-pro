import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../components/Layout/MainLayout";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Snackbar,
  Switch,
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
import BusinessIcon from "@mui/icons-material/Business";
import BrushIcon from "@mui/icons-material/Brush";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ExtensionIcon from "@mui/icons-material/Extension";
import HistoryIcon from "@mui/icons-material/History";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { C, fieldSx, saveBtnSx } from "../components/common/formStyles";
import {
  getTaxRates,
  createTaxRate,
  updateTaxRate,
  deleteTaxRate,
} from "../services/taxService";
import { getOrgProfile, updateOrgProfile } from "../services/organizationProfileService";
import { useTranslation } from "react-i18next";

// ── Settings sub-nav ──────────────────────────────────────────────────────────
const SETTINGS_NAV = [
  { labelKey: "settingsNav.organization", path: "/settings/organization-profile", icon: <BusinessIcon sx={{ fontSize: 18 }} /> },
  { labelKey: "settingsNav.branding",     path: "/settings/branding",             icon: <BrushIcon sx={{ fontSize: 18 }} /> },
  { labelKey: "settingsNav.invoicePreferences", path: "/settings/invoice-preferences", icon: <DescriptionIcon sx={{ fontSize: 18 }} /> },
  { labelKey: "settingsNav.taxes",         path: "/settings/taxes",                icon: <ReceiptLongIcon sx={{ fontSize: 18 }} /> },
  { labelKey: "settingsNav.userManagement", path: "/settings/users",              icon: <PeopleIcon sx={{ fontSize: 18 }} /> },
  { labelKey: "settingsNav.roles",         path: "/settings/roles",               icon: <AdminPanelSettingsIcon sx={{ fontSize: 18 }} /> },
  { labelKey: "settingsNav.automation",    path: "/settings/automation",          icon: <NotificationsActiveIcon sx={{ fontSize: 18 }} /> },
  { labelKey: "settingsNav.integrations",  path: "/settings/integrations",        icon: <ExtensionIcon sx={{ fontSize: 18 }} /> },
  { labelKey: "settingsNav.auditLog",      path: "/settings/audit-log",           icon: <HistoryIcon sx={{ fontSize: 18 }} /> },
];

const EMPTY_RATE = { name: "", rate: "", type: "GST", is_default: false };

function SettingsSubNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  return (
    <Paper
      elevation={0}
      sx={{
        width: 210,
        flexShrink: 0,
        bgcolor: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: "4px",
        alignSelf: "flex-start",
      }}
    >
      <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${C.divider}` }}>
        <Typography
          sx={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            color: C.hint,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Settings
        </Typography>
      </Box>
      <List disablePadding>
        {SETTINGS_NAV.map(({ labelKey, path, icon }) => {
          const active = pathname === path;
          return (
            <ListItemButton
              key={path}
              selected={active}
              onClick={() => navigate(path)}
              sx={{
                px: 2,
                py: 0.9,
                "&.Mui-selected": {
                  bgcolor: "#f0f4ff",
                  "& .MuiListItemText-primary": { color: "#1a56db", fontWeight: 600 },
                  "& .MuiListItemIcon-root": { color: "#1a56db" },
                },
                "&:hover": { bgcolor: "#f5f7fa" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 30, color: C.hint }}>{icon}</ListItemIcon>
              <ListItemText
                primary={t(labelKey)}
                primaryTypographyProps={{ fontSize: "0.8125rem", fontWeight: active ? 600 : 400 }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
}

// ── Tax Rate Dialog ───────────────────────────────────────────────────────────
function TaxRateDialog({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY_RATE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : { ...EMPTY_RATE });
      setError("");
    }
  }, [open, initial]);

  const handle = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async () => {
    const rate = parseFloat(form.rate);
    if (!form.name.trim()) return setError("Name is required");
    if (isNaN(rate) || rate < 0 || rate > 100) return setError("Rate must be 0–100");
    if (!["GST", "CESS", "Exempt"].includes(form.type)) return setError("Invalid type");
    setSaving(true);
    try {
      await onSave({ name: form.name.trim(), rate, type: form.type, is_default: form.is_default });
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontSize: "1rem", fontWeight: 600, pb: 1 }}>
        {initial ? "Edit Tax Rate" : "Add Tax Rate"}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
        {error && <Alert severity="error" sx={{ py: 0 }}>{error}</Alert>}
        <TextField
          label="Name"
          name="name"
          value={form.name}
          onChange={handle}
          size="small"
          fullWidth
          sx={fieldSx}
          placeholder="e.g. GST 18%"
        />
        <TextField
          label="Rate (%)"
          name="rate"
          type="number"
          value={form.rate}
          onChange={handle}
          size="small"
          fullWidth
          sx={fieldSx}
          inputProps={{ min: 0, max: 100, step: 0.5 }}
        />
        <TextField
          select
          label="Type"
          name="type"
          value={form.type}
          onChange={handle}
          size="small"
          fullWidth
          sx={fieldSx}
        >
          {["GST", "CESS", "Exempt"].map((t) => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          control={
            <Switch
              name="is_default"
              checked={Boolean(form.is_default)}
              onChange={handle}
              size="small"
            />
          }
          label={<Typography sx={{ fontSize: "0.8125rem" }}>Set as default</Typography>}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small" sx={{ color: C.hint, textTransform: "none" }}>Cancel</Button>
        <Button
          onClick={submit}
          size="small"
          variant="contained"
          disabled={saving}
          disableElevation
          sx={{ ...saveBtnSx, minWidth: 90 }}
        >
          {saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const TaxSettings = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // GST Settings (from org profile)
  const [gstEnabled, setGstEnabled] = useState(true);
  const [gstin, setGstin] = useState("");
  const [gstRegType, setGstRegType] = useState("regular");
  const [profileData, setProfileData] = useState(null);
  const [gstSaving, setGstSaving] = useState(false);

  const toast = useCallback((message, severity = "success") => {
    setSnack({ open: true, message, severity });
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [ratesData, profile] = await Promise.all([getTaxRates(), getOrgProfile()]);
        if (!active) return;
        setRates(Array.isArray(ratesData) ? ratesData : []);
        setProfileData(profile);
        setGstEnabled(profile.gst_enabled !== false);
        setGstin(profile.gstin || "");
        setGstRegType(profile.gst_registration_type || "regular");
      } catch {
        if (active) toast("Failed to load settings", "error");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [toast]);

  const handleSaveGstSettings = async () => {
    if (!profileData) return;
    setGstSaving(true);
    try {
      const updated = await updateOrgProfile({
        ...profileData,
        gst_enabled: gstEnabled,
        gstin,
        gst_registration_type: gstRegType,
      });
      setProfileData(updated);
      toast("GST settings saved");
    } catch {
      toast("Failed to save GST settings", "error");
    } finally {
      setGstSaving(false);
    }
  };

  const handleSaveRate = async (data) => {
    if (editTarget) {
      const updated = await updateTaxRate(editTarget.id, data);
      setRates((prev) => prev.map((r) => (r.id === editTarget.id ? updated : r)));
      toast("Tax rate updated");
    } else {
      const created = await createTaxRate(data);
      setRates((prev) => [...prev, created]);
      toast("Tax rate added");
    }
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteTaxRate(deleteConfirm.id);
      setRates((prev) => prev.filter((r) => r.id !== deleteConfirm.id));
      toast("Tax rate deleted");
    } catch {
      toast("Failed to delete", "error");
    }
    setDeleteConfirm(null);
  };

  const typeChip = (type) => {
    const color = type === "GST" ? "primary" : type === "CESS" ? "warning" : "default";
    return <Chip label={type} size="small" color={color} sx={{ fontSize: "0.7rem", height: 20 }} />;
  };

  return (
    <MainLayout>
      <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", py: 2.5, px: { xs: 1, md: 3 } }}>
        <Box sx={{ maxWidth: 1020, mx: "auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
            {/* ── Page header ── */}
            <Box>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 600, color: "#151a25" }}>
                Tax Settings
              </Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: C.hint, mt: 0.25 }}>
                Configure GST settings and manage tax rates for your invoices.
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <>
                {/* ── GST Settings Card ── */}
                <Paper
                  elevation={0}
                  sx={{
                    border: `1px solid ${C.border}`,
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      borderBottom: `1px solid ${C.divider}`,
                      bgcolor: "#fafbfc",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#2d3748" }}>
                      GST Settings
                    </Typography>
                  </Box>
                  <Box sx={{ px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 2 }}>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={gstEnabled}
                            onChange={(e) => setGstEnabled(e.target.checked)}
                            size="small"
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                            Enable GST
                          </Typography>
                        }
                      />
                      <Typography sx={{ fontSize: "0.75rem", color: C.hint }}>
                        When enabled, CGST/SGST or IGST is automatically calculated on invoices.
                      </Typography>
                    </Box>

                    {gstEnabled && (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <TextField
                          label="GSTIN"
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value.toUpperCase())}
                          size="small"
                          sx={fieldSx}
                          placeholder="22AAAAA0000A1Z5"
                          helperText="15-character GST Identification Number"
                          inputProps={{ maxLength: 15 }}
                        />
                        <TextField
                          select
                          label="GST Registration Type"
                          value={gstRegType}
                          onChange={(e) => setGstRegType(e.target.value)}
                          size="small"
                          sx={fieldSx}
                        >
                          <MenuItem value="regular">Regular</MenuItem>
                          <MenuItem value="composition">Composition Scheme</MenuItem>
                          <MenuItem value="unregistered">Unregistered</MenuItem>
                        </TextField>
                      </Box>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 0.5 }}>
                      <Button
                        variant="contained"
                        size="small"
                        disableElevation
                        disabled={gstSaving || !profileData}
                        onClick={handleSaveGstSettings}
                        sx={saveBtnSx}
                      >
                        {gstSaving ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : "Save GST Settings"}
                      </Button>
                    </Box>
                  </Box>
                </Paper>

                {/* ── Tax Rates Card ── */}
                <Paper
                  elevation={0}
                  sx={{
                    border: `1px solid ${C.border}`,
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      borderBottom: `1px solid ${C.divider}`,
                      bgcolor: "#fafbfc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#2d3748" }}>
                      Tax Rates
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => { setEditTarget(null); setDialogOpen(true); }}
                      sx={{
                        textTransform: "none",
                        fontSize: "0.8125rem",
                        borderColor: C.border,
                        color: "#1a56db",
                        "&:hover": { borderColor: "#1a56db", bgcolor: "#f0f4ff" },
                      }}
                    >
                      Add Rate
                    </Button>
                  </Box>

                  {rates.length === 0 ? (
                    <Box sx={{ py: 5, textAlign: "center" }}>
                      <Typography sx={{ fontSize: "0.875rem", color: C.hint }}>
                        No tax rates found. Default Indian GST slabs will be auto-seeded on first invoice.
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer sx={{ overflowX: "hidden" }}>
                      <Table size="small" sx={{ tableLayout: "fixed" }}>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#f8fafc" }}>
                            {["Name", "Rate", "Type", "CGST", "SGST", "IGST", ""].map((h) => (
                              <TableCell
                                key={h}
                                sx={{
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  color: C.hint,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.04em",
                                  py: 1,
                                  borderBottom: `1px solid ${C.divider}`,
                                }}
                              >
                                {h}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rates.map((r) => (
                            <TableRow
                              key={r.id}
                              sx={{ "&:hover": { bgcolor: "#f8fafc" }, "&:last-child td": { borderBottom: 0 } }}
                            >
                              <TableCell sx={{ fontSize: "0.8125rem", py: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  {r.name}
                                  {r.is_default && (
                                    <Chip label="Default" size="small" sx={{ fontSize: "0.65rem", height: 18, bgcolor: "#e8f5e9", color: "#2e7d32" }} />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontSize: "0.8125rem", py: 1 }}>{r.rate}%</TableCell>
                              <TableCell sx={{ py: 1 }}>{typeChip(r.type)}</TableCell>
                              <TableCell sx={{ fontSize: "0.8125rem", py: 1, color: C.hint }}>
                                {r.type !== "Exempt" ? `${(r.components?.cgst ?? r.rate / 2)}%` : "—"}
                              </TableCell>
                              <TableCell sx={{ fontSize: "0.8125rem", py: 1, color: C.hint }}>
                                {r.type !== "Exempt" ? `${(r.components?.sgst ?? r.rate / 2)}%` : "—"}
                              </TableCell>
                              <TableCell sx={{ fontSize: "0.8125rem", py: 1, color: C.hint }}>
                                {r.type !== "Exempt" ? `${(r.components?.igst ?? r.rate)}%` : "—"}
                              </TableCell>
                              <TableCell sx={{ py: 1, textAlign: "right" }}>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => { setEditTarget(r); setDialogOpen(true); }}
                                    sx={{ color: C.hint, "&:hover": { color: "#1a56db" } }}
                                  >
                                    <EditIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => setDeleteConfirm(r)}
                                    sx={{ color: C.hint, "&:hover": { color: "#e53935" } }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Paper>
              </>
            )}
        </Box>
      </Box>

      {/* ── Add/Edit Dialog ── */}
      <TaxRateDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditTarget(null); }}
        onSave={handleSaveRate}
        initial={editTarget}
      />

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} maxWidth="xs">
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 600 }}>Delete Tax Rate</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.875rem" }}>
            Delete <strong>{deleteConfirm?.name}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)} size="small" sx={{ color: C.hint, textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            size="small"
            variant="contained"
            disableElevation
            sx={{ bgcolor: "#e53935", "&:hover": { bgcolor: "#c62828" }, textTransform: "none", fontSize: "0.8125rem" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default TaxSettings;
