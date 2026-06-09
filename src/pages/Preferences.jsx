import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Button, CircularProgress, Chip, Container, FormControlLabel,
  MenuItem, Paper, Snackbar, Alert, Switch, TextField, Typography,
} from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import { Link as RouterLink } from "react-router-dom";
import MainLayout from "../components/Layout/MainLayout";
import { getPreferences, updatePreferences } from "../services/meService";
import {
  AppSelect, C, ZohoRow, fieldSx, footerSx, saveBtnSx, cancelBtnSx, menuItemSx,
} from "../components/common/formStyles";

function SectionHeader({ children }) {
  return (
    <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
      <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#333", textAlign: "left" }}>
        {children}
      </Typography>
    </Box>
  );
}

const DASHBOARDS = [{ value: "main", label: "Main Dashboard" }];
const THEMES = [
  { value: "light",  label: "Light",  soon: false },
  { value: "dark",   label: "Dark",   soon: true },
  { value: "system", label: "System", soon: true },
];

export default function Preferences() {
  const [form, setForm] = useState({
    theme: "light",
    currency_format: "INR",
    default_dashboard: "main",
    compact_mode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const fetchPrefs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPreferences();
      setForm((prev) => ({
        ...prev,
        theme:             data.theme             ?? prev.theme,
        currency_format:   data.currency_format   ?? prev.currency_format,
        default_dashboard: data.default_dashboard ?? prev.default_dashboard,
        compact_mode:      Boolean(data.compact_mode ?? prev.compact_mode),
      }));
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrefs(); }, [fetchPrefs]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences(form);
      const data = await getPreferences();
      setForm((prev) => ({
        ...prev,
        theme:             data.theme             ?? prev.theme,
        currency_format:   data.currency_format   ?? prev.currency_format,
        default_dashboard: data.default_dashboard ?? prev.default_dashboard,
        compact_mode:      Boolean(data.compact_mode ?? prev.compact_mode),
      }));
      setToast({ open: true, message: "Preferences saved", severity: "success" });
    } catch {
      setToast({ open: true, message: "Failed to save preferences", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout title="Preferences">
      <Box sx={{ bgcolor: C.pageBg, minHeight: "100vh", pb: 6, overflowX: "hidden" }}>
        <Container maxWidth={false} sx={{ pt: 3, px: { xs: 1.5, md: 2.5 } }}>
          <Box sx={{ minWidth: 0 }}>
            <Paper
              elevation={0}
              sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden" }}
            >
              <Box sx={{ px: { xs: 2, md: 3 } }}>
                <SectionHeader>Display</SectionHeader>

                <ZohoRow label="Theme" hint="Choose your preferred colour scheme">
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {THEMES.map(({ value, label, soon }) => (
                      <Box
                        key={value}
                        onClick={() => !soon && setForm((f) => ({ ...f, theme: value }))}
                        sx={{
                          px: 2, py: 0.75,
                          borderRadius: "4px",
                          border: "1px solid",
                          borderColor: form.theme === value ? C.primary : C.border,
                          bgcolor: form.theme === value ? "#EBF2FD" : C.white,
                          cursor: soon ? "default" : "pointer",
                          opacity: soon ? 0.55 : 1,
                          display: "flex", alignItems: "center", gap: 0.75,
                        }}
                      >
                        <Typography sx={{
                          fontSize: "0.875rem",
                          fontWeight: form.theme === value ? 600 : 400,
                          color: form.theme === value ? C.primary : C.label,
                        }}>
                          {label}
                        </Typography>
                        {soon && (
                          <Chip label="Soon" size="small" sx={{ height: 16, fontSize: "0.625rem" }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                </ZohoRow>

                <ZohoRow label="Compact Mode" hint="Reduce spacing in tables and lists" noDivider>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(form.compact_mode)}
                        name="compact_mode"
                        onChange={handleChange}
                        size="small"
                        disabled={loading}
                        inputProps={{ "data-testid": "pref-compact-mode" }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "0.8125rem", color: C.label }}>
                        {form.compact_mode ? "On" : "Off"}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                </ZohoRow>
              </Box>

              <Box sx={{ px: { xs: 2, md: 3 }, borderTop: `1px solid ${C.divider}` }}>
                <SectionHeader>Regional</SectionHeader>

                <ZohoRow label="Currency Format">
                  <TextField
                    size="small"
                    fullWidth
                    name="currency_format"
                    value={form.currency_format}
                    onChange={handleChange}
                    disabled={loading}
                    sx={fieldSx}
                  />
                </ZohoRow>

                <ZohoRow label="Locale Settings" hint="Timezone, language, and date format" noDivider>
                  <Box>
                    <Typography sx={{ fontSize: "0.8125rem", color: C.hint, mb: 1 }}>
                      Manage timezone, language, and date format in My Profile to avoid duplicate settings.
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/settings/my-profile"
                      variant="outlined"
                      size="small"
                      sx={{ textTransform: "none", fontSize: "0.8125rem" }}
                    >
                      Open My Profile
                    </Button>
                  </Box>
                </ZohoRow>
              </Box>

              <Box sx={{ px: { xs: 2, md: 3 }, borderTop: `1px solid ${C.divider}` }}>
                <SectionHeader>Navigation</SectionHeader>

                <ZohoRow label="Default Dashboard" noDivider>
                  <AppSelect name="default_dashboard" value={form.default_dashboard} onChange={handleChange} disabled={loading}>
                    {DASHBOARDS.map((d) => <MenuItem key={d.value} value={d.value} sx={menuItemSx}>{d.label}</MenuItem>)}
                  </AppSelect>
                </ZohoRow>
              </Box>

              <Box sx={footerSx}>
                <Button
                  variant="outlined"
                  onClick={fetchPrefs}
                  disabled={saving || loading}
                  startIcon={<UndoIcon sx={{ fontSize: 16 }} />}
                  sx={cancelBtnSx}
                >
                  Discard
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving || loading}
                  startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                  sx={saveBtnSx}
                >
                  {saving ? "Saving…" : "Save Preferences"}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>

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
