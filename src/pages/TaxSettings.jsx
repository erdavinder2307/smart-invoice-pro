import React, { useCallback, useEffect, useState } from "react";
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
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
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
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { C, fieldSx, saveBtnSx } from "../components/common/formStyles";
import {
  getTaxRates,
  createTaxRate,
  updateTaxRate,
  deleteTaxRate,
} from "../services/taxService";
import { getOrgProfile, updateOrgProfile } from "../services/organizationProfileService";
import { useOrgGst } from "../context/OrgGstContext";

const EMPTY_RATE = { name: "", rate: "", type: "GST", is_default: false };
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

// ── Per-type contextual help text ────────────────────────────────────────────
const REG_TYPE_INFO = {
  regular: {
    label: "Regular",
    badge: null,
    help: "Full GST taxpayer. GSTIN is mandatory. CGST/SGST/IGST will be calculated and shown on all sales documents.",
    gstinRequired: true,
    canChargeTax: true,
  },
  composition: {
    label: "Composition Scheme",
    badge: "Restricted",
    badgeColor: "warning",
    help: 'Registered under the GST Composition Scheme. GSTIN is mandatory, but you cannot collect GST on sales. A statutory note — "Composition Taxable Person. Not eligible to collect tax on supplies." — will appear on invoices automatically.',
    gstinRequired: true,
    canChargeTax: false,
  },
  unregistered: {
    label: "Unregistered",
    badge: "No GST",
    badgeColor: "default",
    help: "Your business is not registered under GST. GSTIN is not required. No GST will appear on any sales or purchase documents.",
    gstinRequired: false,
    canChargeTax: false,
  },
};

// ── Main Component ────────────────────────────────────────────────────────────
const TaxSettings = () => {
  const { reload: reloadGstContext } = useOrgGst();

  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // GST Settings — registration type is now the single source of truth
  const [gstin, setGstin] = useState("");
  const [gstRegType, setGstRegType] = useState("regular");
  const [profileData, setProfileData] = useState(null);
  const [gstSaving, setGstSaving] = useState(false);
  const [gstErrors, setGstErrors] = useState({});
  // Confirm dialog when switching to Unregistered with existing GSTIN
  const [unregConfirmOpen, setUnregConfirmOpen] = useState(false);
  const [pendingRegType, setPendingRegType] = useState(null);

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

  const handleRegTypeChange = (newType) => {
    if (newType === "unregistered" && gstin) {
      // Warn: switching to Unregistered clears GSTIN
      setPendingRegType(newType);
      setUnregConfirmOpen(true);
    } else {
      setGstRegType(newType);
      setGstErrors({});
    }
  };

  const confirmUnregistered = () => {
    setGstRegType(pendingRegType);
    setGstin("");
    setGstErrors({});
    setUnregConfirmOpen(false);
    setPendingRegType(null);
  };

  const validateGstForm = () => {
    const errs = {};
    const info = REG_TYPE_INFO[gstRegType] || REG_TYPE_INFO.regular;
    if (info.gstinRequired) {
      if (!gstin.trim()) {
        errs.gstin = `GSTIN is required for ${info.label} registration type.`;
      } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin.trim().toUpperCase())) {
        errs.gstin = "Invalid GSTIN format. Expected 15-character GSTIN (e.g. 22AAAAA0000A1Z5).";
      }
    }
    setGstErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveGstSettings = async () => {
    if (!profileData) return;
    if (!validateGstForm()) return;
    setGstSaving(true);
    try {
      const updated = await updateOrgProfile({
        ...profileData,
        gstin: gstRegType === "unregistered" ? "" : gstin.trim().toUpperCase(),
        gst_registration_type: gstRegType,
      });
      setProfileData(updated);
      setGstRegType(updated.gst_registration_type || gstRegType);
      reloadGstContext(); // refresh all components that depend on OrgGstContext
      toast("GST settings saved");
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to save GST settings";
      toast(msg, "error");
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
      <Box sx={{ bgcolor: C.pageBg, minHeight: "100vh", pb: 6 }}>
        <Box sx={{ pt: 3, px: 2.5, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
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
                {/* ── GST Registration Type Card ── */}
                <Paper
                  elevation={0}
                  sx={{ border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden" }}
                >
                  <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${C.divider}`, bgcolor: "#fafbfc" }}>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#2d3748" }}>
                      GST Registration
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: C.hint, mt: 0.25 }}>
                      Your registration type determines how GST is applied across all documents.
                    </Typography>
                  </Box>
                  <Box sx={{ px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>

                    {/* Registration type radio group */}
                    <RadioGroup
                      value={gstRegType}
                      onChange={(e) => handleRegTypeChange(e.target.value)}
                      sx={{ gap: 1 }}
                    >
                      {Object.entries(REG_TYPE_INFO).map(([value, info]) => (
                        <Box
                          key={value}
                          onClick={() => handleRegTypeChange(value)}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.5,
                            p: 1.5,
                            border: `1px solid ${gstRegType === value ? "#1a56db" : C.border}`,
                            borderRadius: "6px",
                            bgcolor: gstRegType === value ? "#f0f4ff" : "#fff",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            "&:hover": { borderColor: "#1a56db", bgcolor: "#f7f9ff" },
                          }}
                        >
                          <FormControlLabel
                            value={value}
                            control={<Radio size="small" sx={{ p: 0.5 }} />}
                            label=""
                            sx={{ m: 0 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#2d3748" }}>
                                {info.label}
                              </Typography>
                              {info.badge && (
                                <Chip
                                  label={info.badge}
                                  size="small"
                                  color={info.badgeColor}
                                  sx={{ fontSize: "0.65rem", height: 18 }}
                                />
                              )}
                            </Box>
                            <Typography sx={{ fontSize: "0.75rem", color: C.hint, lineHeight: 1.5 }}>
                              {info.help}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </RadioGroup>

                    {/* GSTIN field — shown only when required */}
                    {REG_TYPE_INFO[gstRegType]?.gstinRequired && (
                      <Box>
                        <TextField
                          label="GSTIN"
                          value={gstin}
                          onChange={(e) => {
                            setGstin(e.target.value.toUpperCase());
                            if (gstErrors.gstin) setGstErrors((p) => ({ ...p, gstin: "" }));
                          }}
                          size="small"
                          sx={{ ...fieldSx, maxWidth: 340 }}
                          placeholder="22AAAAA0000A1Z5"
                          helperText={gstErrors.gstin || "15-character GST Identification Number"}
                          error={Boolean(gstErrors.gstin)}
                          inputProps={{ maxLength: 15 }}
                          fullWidth
                        />
                      </Box>
                    )}

                    {/* Composition warning banner */}
                    {gstRegType === "composition" && (
                      <Alert
                        severity="warning"
                        icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />}
                        sx={{ fontSize: "0.8125rem", py: 0.75 }}
                      >
                        Composition dealers cannot collect GST on sales. Tax columns will be hidden from
                        invoices and quotes. A statutory declaration will be printed on all sales documents.
                      </Alert>
                    )}

                    {/* Unregistered info banner */}
                    {gstRegType === "unregistered" && (
                      <Alert
                        severity="info"
                        icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />}
                        sx={{ fontSize: "0.8125rem", py: 0.75 }}
                      >
                        No GST will appear on invoices, quotes, or PDFs. GST reports will be unavailable.
                      </Alert>
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

      {/* ── Unregistered confirmation dialog ── */}
      <Dialog open={unregConfirmOpen} onClose={() => setUnregConfirmOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
          Switch to Unregistered?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
            Switching to <strong>Unregistered</strong> will clear your saved GSTIN
            (<strong>{gstin}</strong>) and disable all GST on future documents.
            <br /><br />
            Existing documents will not be changed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => { setUnregConfirmOpen(false); setPendingRegType(null); }}
            size="small"
            sx={{ color: C.hint, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmUnregistered}
            size="small"
            variant="contained"
            disableElevation
            sx={{ bgcolor: "#e53935", "&:hover": { bgcolor: "#c62828" }, textTransform: "none", fontSize: "0.8125rem" }}
          >
            Switch to Unregistered
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
