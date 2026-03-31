import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../components/Layout/MainLayout";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import BrushIcon from "@mui/icons-material/Brush";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ExtensionIcon from "@mui/icons-material/Extension";
import HistoryIcon from "@mui/icons-material/History";
import EmailIcon from "@mui/icons-material/Email";
import EventIcon from "@mui/icons-material/Event";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { C, fieldSx } from "../components/common/formStyles";
import { getAutomationSettings, saveAutomationSettings } from "../services/automationService";

// ── Settings sub-nav ──────────────────────────────────────────────────────────
const SETTINGS_NAV = [
  { label: "Organization Profile", path: "/settings/organization-profile", icon: <BusinessIcon sx={{ fontSize: 18 }} /> },
  { label: "Branding",             path: "/settings/branding",             icon: <BrushIcon sx={{ fontSize: 18 }} /> },
  { label: "Invoice Preferences",  path: "/settings/invoice-preferences",  icon: <DescriptionIcon sx={{ fontSize: 18 }} /> },
  { label: "Taxes",                path: "/settings/taxes",                icon: <ReceiptLongIcon sx={{ fontSize: 18 }} /> },
  { label: "User Management",      path: "/settings/users",                icon: <PeopleIcon sx={{ fontSize: 18 }} /> },
  { label: "Roles",                path: "/settings/roles",                icon: <AdminPanelSettingsIcon sx={{ fontSize: 18 }} /> },
  { label: "Automation",           path: "/settings/automation",           icon: <NotificationsActiveIcon sx={{ fontSize: 18 }} /> },
  { label: "Integrations",         path: "/settings/integrations",         icon: <ExtensionIcon sx={{ fontSize: 18 }} /> },
  { label: "Audit Log",             path: "/settings/audit-log",             icon: <HistoryIcon sx={{ fontSize: 18 }} /> },
];

// ── SettingsSubNav ─────────────────────────────────────────────────────────────
function SettingsSubNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
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
      <List dense disablePadding>
        {SETTINGS_NAV.map((item) => {
          const active = pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 0,
                px: 2,
                py: 0.75,
                "&.Mui-selected": { bgcolor: "#e8f0fe", color: C.primary },
                "&.Mui-selected .MuiListItemIcon-root": { color: C.primary },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: active ? C.primary : C.hint }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: "0.8125rem", fontWeight: active ? 600 : 400 }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
}

// ── Reminder type metadata ─────────────────────────────────────────────────────
const REMINDER_META = {
  before_due: {
    label:       "Before Due Date",
    icon:        <EventIcon sx={{ fontSize: 20, color: "#1a73e8" }} />,
    description: (days) => `Send a reminder ${days} day${days !== 1 ? "s" : ""} before the invoice due date.`,
    hasdays:     true,
    hint:        "days before due date",
  },
  on_due: {
    label:       "On Due Date",
    icon:        <CheckCircleOutlineIcon sx={{ fontSize: 20, color: "#388e3c" }} />,
    description: () => "Send a reminder on the day the invoice is due.",
    hasdays:     false,
    hint:        null,
  },
  after_due: {
    label:       "After Due Date",
    icon:        <WarningAmberIcon sx={{ fontSize: 20, color: "#f57c00" }} />,
    description: (days) => `Send a follow-up reminder ${days} day${days !== 1 ? "s" : ""} after the due date.`,
    hasdays:     true,
    hint:        "days after due date",
  },
};

const REMINDER_ORDER = ["before_due", "on_due", "after_due"];

// Build a default reminders map indexed by type for easy state management
function buildDefaults(reminders) {
  const base = {
    before_due: { type: "before_due", days: 3,  enabled: true },
    on_due:     { type: "on_due",     days: 0,  enabled: true },
    after_due:  { type: "after_due",  days: 2,  enabled: true },
  };
  if (Array.isArray(reminders)) {
    reminders.forEach((r) => {
      if (base[r.type] !== undefined) {
        base[r.type] = { ...base[r.type], ...r };
      }
    });
  }
  return base;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AutomationSettings() {
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [rules, setRules]             = useState(buildDefaults(null));
  const [toast, setToast]             = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") =>
    setToast({ open: true, message, severity });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAutomationSettings();
      setEmailEnabled(data.email_enabled !== false);
      setRules(buildDefaults(data.payment_reminders));
    } catch {
      setError("Failed to load automation settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const updateRule = (type, field, value) => {
    setRules((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payment_reminders = REMINDER_ORDER.map((t) => rules[t]);
      await saveAutomationSettings({ email_enabled: emailEnabled, payment_reminders });
      showToast("Automation settings saved.");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <Box
        sx={{
          display: "flex",
          gap: 2.5,
          p: 3,
          bgcolor: C.pageBg,
          minHeight: "calc(100vh - 64px)",
          alignItems: "flex-start",
        }}
      >
        <SettingsSubNav />

        {/* Content panel */}
        <Box sx={{ flex: 1, minWidth: 0, maxWidth: 640 }}>
          {/* Header */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1rem", color: C.label }}>
              Automation
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: C.hint, mt: 0.25 }}>
              Configure automatic payment reminders sent to customers.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <>
              {/* ── Email toggles section ─────────────────────────────────── */}
              <Paper
                elevation={0}
                sx={{
                  border: `1px solid ${C.border}`,
                  borderRadius: "4px",
                  bgcolor: C.white,
                  mb: 2,
                }}
              >
                {/* Section header */}
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.25,
                    borderBottom: `1px solid ${C.divider}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <EmailIcon sx={{ fontSize: 16, color: C.hint }} />
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: C.label }}>
                    Email Notifications
                  </Typography>
                </Box>

                <Box sx={{ px: 2.5, py: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailEnabled}
                        onChange={(e) => setEmailEnabled(e.target.checked)}
                        size="small"
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: C.label, lineHeight: 1.3 }}>
                          Enable email reminders
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: C.hint, mt: 0.25 }}>
                          When off, no reminder emails will be sent regardless of the rules below.
                        </Typography>
                      </Box>
                    }
                    sx={{ alignItems: "flex-start", gap: 0.5 }}
                  />
                </Box>
              </Paper>

              {/* ── Payment reminders section ─────────────────────────────── */}
              <Paper
                elevation={0}
                sx={{
                  border: `1px solid ${C.border}`,
                  borderRadius: "4px",
                  bgcolor: C.white,
                  mb: 2.5,
                  opacity: emailEnabled ? 1 : 0.6,
                  pointerEvents: emailEnabled ? "auto" : "none",
                }}
              >
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.25,
                    borderBottom: `1px solid ${C.divider}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <NotificationsActiveIcon sx={{ fontSize: 16, color: C.hint }} />
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: C.label }}>
                    Payment Reminders
                  </Typography>
                </Box>

                {REMINDER_ORDER.map((type, idx) => {
                  const meta = REMINDER_META[type];
                  const rule = rules[type];
                  const isLast = idx === REMINDER_ORDER.length - 1;

                  return (
                    <Box
                      key={type}
                      sx={{
                        px: 2.5,
                        py: 2,
                        borderBottom: isLast ? "none" : `1px solid ${C.divider}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                        }}
                      >
                        {/* Icon */}
                        <Box sx={{ mt: 0.25, flexShrink: 0 }}>{meta.icon}</Box>

                        {/* Label + description */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: C.label }}>
                              {meta.label}
                            </Typography>
                            <Switch
                              checked={rule.enabled}
                              onChange={(e) => updateRule(type, "enabled", e.target.checked)}
                              size="small"
                              color="primary"
                            />
                          </Box>

                          {/* Days input (only for before_due / after_due) */}
                          {meta.hasdays && (
                            <Box sx={{ mt: 1.25, display: "flex", alignItems: "center", gap: 1.5 }}>
                              <TextField
                                type="number"
                                size="small"
                                value={rule.days}
                                onChange={(e) => {
                                  const v = Math.max(1, Math.min(60, parseInt(e.target.value, 10) || 1));
                                  updateRule(type, "days", v);
                                }}
                                inputProps={{ min: 1, max: 60 }}
                                disabled={!rule.enabled}
                                sx={{
                                  ...fieldSx,
                                  width: 90,
                                  "& .MuiInputBase-input": {
                                    textAlign: "center",
                                    fontSize: "0.875rem",
                                    py: "6px",
                                    px: "10px",
                                  },
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Typography sx={{ fontSize: "0.75rem", color: C.hint }}>d</Typography>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                              <Typography sx={{ fontSize: "0.8125rem", color: C.hint }}>
                                {meta.hint}
                              </Typography>
                            </Box>
                          )}

                          {/* Description line */}
                          <Typography sx={{ fontSize: "0.75rem", color: C.hint, mt: 0.75, fontStyle: "italic" }}>
                            {meta.description(rule.days)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Paper>

              {/* ── Save button ───────────────────────────────────────────── */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ textTransform: "none", fontSize: "0.8125rem", px: 3 }}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
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
