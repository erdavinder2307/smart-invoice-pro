import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Button, CircularProgress, Container, MenuItem, Paper,
  Snackbar, Alert, TextField, Typography, Avatar,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import UndoIcon from "@mui/icons-material/Undo";
import MainLayout from "../components/Layout/MainLayout";
import { getMe, updateMe } from "../services/meService";
import { useMe } from "../context/MeContext";
import {
  AppSelect, C, ZohoRow, fieldSx, footerSx, saveBtnSx, cancelBtnSx, menuItemSx,
} from "../components/common/formStyles";
import { useTranslation } from "react-i18next";

// ── Constants ─────────────────────────────────────────────────────────────────
const TIMEZONES = [
  "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo",
  "Europe/London", "Europe/Paris", "America/New_York", "America/Los_Angeles", "UTC",
];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"];
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
];
const ROLE_COLORS = {
  Admin:      { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  Manager:    { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  Accountant: { bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA" },
  Sales:      { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
};

function SectionHeader({ children }) {
  return (
    <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
      <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#333", textAlign: "left" }}>
        {children}
      </Typography>
    </Box>
  );
}

const getInitials = (name) => {
  if (!name) return "U";
  const p = name.trim().split(/\s+/).filter(Boolean);
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0][0].toUpperCase();
};

const formatDate = (iso) => {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "—"; }
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MyProfile() {
  const { refreshMe } = useMe();
  const { i18n } = useTranslation();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const [form, setForm] = useState({
    full_name: "",
    display_name: "",
    phone: "",
    designation: "",
    department: "",
    timezone: "Asia/Kolkata",
    language: "en",
    date_format: "DD/MM/YYYY",
  });

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMe();
      setMe(data);
      setForm({
        full_name:    data.full_name    || "",
        display_name: data.display_name || "",
        phone:        data.phone        || "",
        designation:  data.designation  || "",
        department:   data.department   || "",
        timezone:     data.timezone     || "Asia/Kolkata",
        language:     data.language     || "en",
        date_format:  data.date_format  || "DD/MM/YYYY",
      });
    } catch {
      setToast({ open: true, message: "Failed to load profile", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      setToast({ open: true, message: "Full name is required", severity: "error" });
      return;
    }
    setSaving(true);
    try {
      await updateMe(form);
      if (form.language && form.language !== i18n.language) {
        await i18n.changeLanguage(form.language);
        localStorage.setItem("app_language", form.language);
      }
      await refreshMe();
      await fetchMe();
      setToast({ open: true, message: "Profile updated successfully", severity: "success" });
    } catch {
      setToast({ open: true, message: "Failed to update profile", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const roleStyle = ROLE_COLORS[me?.role] || { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" };
  const displayName = me?.full_name || me?.display_name || "";

  return (
    <MainLayout title="My Profile">
      <Box sx={{ bgcolor: C.pageBg, minHeight: "100vh", pb: 6 }}>
        <Container maxWidth={false} sx={{ pt: 3, px: 2.5 }}>
          <Box sx={{ minWidth: 0 }}>

            {/* ── Identity header ─────────────────────────────────────── */}
            <Paper
              elevation={0}
              sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden", mb: 2.5 }}
            >
              <Box sx={{ px: 3, py: 2, display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
                <Avatar
                  src={me?.avatar_url}
                  sx={{ width: 52, height: 52, fontSize: "1.125rem", fontWeight: 700, flexShrink: 0, bgcolor: C.primary }}
                >
                  {loading ? <CircularProgress size={18} color="inherit" /> : getInitials(displayName)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#222", lineHeight: 1.3 }}>
                    {loading ? "Loading…" : (displayName || "—")}
                  </Typography>
                  <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                    {me?.role && !loading && (
                      <Box sx={{
                        display: "inline-flex", alignItems: "center", px: 1, py: "2px",
                        borderRadius: "4px", bgcolor: roleStyle.bg, color: roleStyle.color,
                        border: "1px solid", borderColor: roleStyle.border,
                        fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.5,
                      }}>
                        {me.role}
                      </Box>
                    )}
                    {me?.designation && !loading && (
                      <Typography sx={{ fontSize: "0.8125rem", color: C.hint }}>{me.designation}</Typography>
                    )}
                    {me?.organization_name && !loading && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <BusinessIcon sx={{ fontSize: 13, color: C.hint }} />
                        <Typography sx={{ fontSize: "0.8125rem", color: C.hint }}>{me.organization_name}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* ── Main form card ──────────────────────────────────────── */}
            <Paper
              elevation={0}
              sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden" }}
            >
              {/* ══ Personal Information ══════════════════════════════════ */}
              <Box sx={{ px: 3 }}>
                <SectionHeader>Personal Information</SectionHeader>

                <ZohoRow label="Full Name" required>
                  <TextField size="small" fullWidth name="full_name" value={form.full_name}
                    onChange={handleChange} disabled={loading} sx={fieldSx} />
                </ZohoRow>
                <ZohoRow label="Display Name" hint="Shown in comments and mentions">
                  <TextField size="small" fullWidth name="display_name" value={form.display_name}
                    onChange={handleChange} disabled={loading} sx={fieldSx} />
                </ZohoRow>
                <ZohoRow label="Email Address" hint="Email cannot be changed here">
                  <TextField size="small" fullWidth value={me?.email || ""} disabled sx={fieldSx} />
                </ZohoRow>
                <ZohoRow label="Phone">
                  <TextField size="small" fullWidth name="phone" value={form.phone}
                    onChange={handleChange} disabled={loading} sx={fieldSx} />
                </ZohoRow>
                <ZohoRow label="Designation">
                  <TextField size="small" fullWidth name="designation" value={form.designation}
                    onChange={handleChange} disabled={loading} sx={fieldSx} />
                </ZohoRow>
                <ZohoRow label="Department" noDivider>
                  <TextField size="small" fullWidth name="department" value={form.department}
                    onChange={handleChange} disabled={loading} sx={fieldSx} />
                </ZohoRow>
              </Box>

              {/* ══ Localisation ══════════════════════════════════════════ */}
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
                <ZohoRow label="Date Format" noDivider>
                  <AppSelect name="date_format" value={form.date_format} onChange={handleChange} disabled={loading}>
                    {DATE_FORMATS.map((f) => <MenuItem key={f} value={f} sx={menuItemSx}>{f}</MenuItem>)}
                  </AppSelect>
                </ZohoRow>
              </Box>

              {/* ══ Organisation Membership ════════════════════════════════ */}
              <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
                <SectionHeader>Organisation Membership</SectionHeader>

                <ZohoRow label="Organisation">
                  <Typography sx={{ fontSize: "0.875rem", color: C.label }}>
                    {me?.organization_name || "—"}
                  </Typography>
                </ZohoRow>
                <ZohoRow label="Role">
                  {me?.role ? (
                    <Box sx={{
                      display: "inline-flex", alignItems: "center", px: 1, py: "2px",
                      borderRadius: "4px", bgcolor: roleStyle.bg, color: roleStyle.color,
                      border: "1px solid", borderColor: roleStyle.border,
                      fontSize: "0.75rem", fontWeight: 700,
                    }}>
                      {me.role}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: "0.875rem", color: C.hint }}>—</Typography>
                  )}
                </ZohoRow>
                <ZohoRow label="Member Since">
                  <Typography sx={{ fontSize: "0.875rem", color: C.label }}>
                    {formatDate(me?.joined_at || me?.created_at)}
                  </Typography>
                </ZohoRow>
                <ZohoRow label="Status" noDivider>
                  <Box sx={{
                    display: "inline-flex", alignItems: "center", px: 1, py: "2px",
                    borderRadius: "4px", bgcolor: "#F0FDF4", color: "#16A34A",
                    border: "1px solid #BBF7D0", fontSize: "0.75rem", fontWeight: 700,
                  }}>
                    Active
                  </Box>
                </ZohoRow>
              </Box>

              {/* ══ Footer ════════════════════════════════════════════════ */}
              <Box sx={footerSx}>
                <Button
                  variant="outlined"
                  onClick={fetchMe}
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
                  {saving ? "Saving…" : "Save Changes"}
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
