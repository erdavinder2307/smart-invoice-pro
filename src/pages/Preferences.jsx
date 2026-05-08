import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Button, CircularProgress, Chip, Container, FormControlLabel,
  MenuItem, Paper, Snackbar, Alert, Switch, TextField, Typography,
} from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import MainLayout from "../components/Layout/MainLayout";
import { getPreferences, updatePreferences } from "../services/meService";
import {
  AppSelect, C, ZohoRow, fieldSx, footerSx, saveBtnSx, cancelBtnSx, menuItemSx,
} from "../components/common/formStyles";
import { useTranslation } from "react-i18next";

function SectionHeader({ children }) {
  return (
    <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
      <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#333", textAlign: "left" }}>
        {children}
      </Typography>
    </Box>
  );
}

const TIMEZONES = [
  "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo",
  "Europe/London", "Europe/Paris", "America/New_York", "America/Los_Angeles", "UTC",
];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"];
const LANGUAGES = [{ value: "en", label: "English" }, { value: "hi", label: "Hindi" }];
const DASHBOARDS = [{ value: "main", label: "Main Dashboard" }];
const THEMES = [
  { value: "light",  label: "Light",  soon: false },
  { value: "dark",   label: "Dark",   soon: true },
  { value: "system", label: "System", soon: true },
];

export default function Preferences() {
  const { i18n } = useTranslation();
  const [form, setForm] = useState({
    theme: "light",
    timezone: "Asia/Kolkata",
    language: "en",
    date_format: "DD/MM/YYYY",
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
        timezone:          data.timezone          ?? prev.timezone,
        language:          data.language          ?? prev.language,
        date_format:       data.date_format       ?? prev.date_format,
        currency_format:   data.currency_format   ?? prev.currency_format,
        default_dashboard: data.default_dashboard ?? prev.default_dashboard,
        compact_mode:      data.compact_mode      ?? prev.compact_mode,
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
      if (form.language && form.language !== i18n.language) {
        await i18n.changeLanguage(form.language);
        localStorage.setItem("app_language", form.language);
      }
      setToast({ open: true, message: "Preferences saved", severity: "success" });
    } catch {
      setToast({ open: true, message: "Failed to save preferences", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout title="Preferences">
      <Box sx={{ bgcolor: C.pageBg, minHeight: "100vh", pb: 6 }}>
        <Container maxWidth={false} sx={{ pt: 3, px: 2.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Paper
              elevation={0}
              sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden" }}
            >
              {/* ══ Display ═══════════════════════════════════════════════ */}
              <Box sx={{ px: 3 }}>
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
                          transition: "border-color 0.15s, background-color 0.15s",
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
                          <Chip
                            label="Soon"
                            size="small"
                            sx={{ height: 16, fontSize: "0.625rem", "& .MuiChip-label": { px: "5px" } }}
                          />
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

              {/* ══ Localisation ═══════════════════════════════════════════ */}
              <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
                <SectionHeader>Localisation</SectionHeader>

                <ZohoRow label="Timezone">
                  <AppSelect name="timezone" value={form.timezone} onChange={handleChange} disabled={loading}>
                    {TIMEZONES.map((tz) => <MenuItem key={tz} value={tz} sx={menuItemSx}>{tz}</MenuItem>)}
                  </AppSelect>
                </ZohoRow>

                <ZohoRow label="Language">
                  <AppSelect name="language" value={form.language} onChange={handleChange} disabled={loading}>
                    {LANGUAGES.map((l) => <MenuItem key={l.value} value={l.value} sx={menuItemSx}>{l.label}</MenuItem>)}
                  </AppSelect>
                </ZohoRow>

                <ZohoRow label="Date Format">
                  <AppSelect name="date_format" value={form.date_format} onChange={handleChange} disabled={loading}>
                    {DATE_FORMATS.map((f) => <MenuItem key={f} value={f} sx={menuItemSx}>{f}</MenuItem>)}
                  </AppSelect>
                </ZohoRow>

                <ZohoRow label="Currency Format" noDivider>
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
              </Box>

              {/* ══ Navigation ═════════════════════════════════════════════ */}
              <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
                <SectionHeader>Navigation</SectionHeader>

                <ZohoRow label="Default Dashboard" noDivider>
                  <AppSelect name="default_dashboard" value={form.default_dashboard} onChange={handleChange} disabled={loading}>
                    {DASHBOARDS.map((d) => <MenuItem key={d.value} value={d.value} sx={menuItemSx}>{d.label}</MenuItem>)}
                  </AppSelect>
                </ZohoRow>
              </Box>

              {/* ══ Footer ═════════════════════════════════════════════════ */}
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
