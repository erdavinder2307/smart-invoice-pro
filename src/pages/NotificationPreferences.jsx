import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Button, CircularProgress, Container, FormControlLabel,
  Paper, Snackbar, Alert, Switch, Typography,
} from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import MainLayout from "../components/Layout/MainLayout";
import { getPreferences, updatePreferences } from "../services/meService";
import { C, ZohoRow, footerSx, saveBtnSx, cancelBtnSx } from "../components/common/formStyles";

function SectionHeader({ children }) {
  return (
    <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
      <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#333", textAlign: "left" }}>
        {children}
      </Typography>
    </Box>
  );
}

const NOTIF_GROUPS = [
  {
    id: "alerts",
    label: "Alerts & Workflows",
    items: [
      { key: "email_notifications",    label: "Email Notifications",    hint: "Receive important updates via email" },
      { key: "workflow_notifications", label: "Workflow Notifications", hint: "Updates on workflows you are part of" },
      { key: "approval_notifications", label: "Approval Alerts",        hint: "Notified when your approval is required" },
    ],
  },
  {
    id: "operational",
    label: "Operational",
    items: [
      { key: "reminder_notifications", label: "Payment Reminders",  hint: "Automated invoice and payment reminders" },
      { key: "operational_alerts",     label: "Operational Alerts", hint: "Low-stock alerts and system notices" },
    ],
  },
];

const DEFAULT_PREFS = {
  email_notifications:    true,
  workflow_notifications: true,
  approval_notifications: true,
  reminder_notifications: true,
  operational_alerts:     true,
};

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const fetchPrefs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPreferences();
      setPrefs({ ...DEFAULT_PREFS, ...(data.notification_preferences || {}) });
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrefs(); }, [fetchPrefs]);

  const handleToggle = (key) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences({ notification_preferences: prefs });
      setToast({ open: true, message: "Notification preferences saved", severity: "success" });
    } catch {
      setToast({ open: true, message: "Failed to save preferences", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = Object.values(prefs).filter(Boolean).length;
  const total = Object.keys(prefs).length;

  return (
    <MainLayout title="Notification Preferences">
      <Box sx={{ bgcolor: C.pageBg, minHeight: "100vh", pb: 6 }}>
        <Container maxWidth={false} sx={{ pt: 3, px: 2.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Paper
              elevation={0}
              sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden" }}
            >
              {NOTIF_GROUPS.map(({ id, label, items }, groupIdx) => (
                <Box key={id} sx={{ px: 3, ...(groupIdx > 0 ? { borderTop: `1px solid ${C.divider}` } : {}) }}>
                  <SectionHeader>{label}</SectionHeader>
                  {items.map(({ key, label: itemLabel, hint }, idx) => (
                    <ZohoRow key={key} label={itemLabel} hint={hint} noDivider={idx === items.length - 1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(prefs[key])}
                            onChange={() => handleToggle(key)}
                            size="small"
                            disabled={loading}
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: "0.8125rem", color: C.label }}>
                            {prefs[key] ? "Enabled" : "Disabled"}
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </ZohoRow>
                  ))}
                </Box>
              ))}

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

            {/* Status line */}
            <Box sx={{ mt: 1.5, px: 0.25 }}>
              <Typography sx={{ fontSize: "0.8125rem", color: C.hint }}>
                {loading ? "Loading…" : `${enabledCount} of ${total} notification types enabled`}
              </Typography>
            </Box>
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
