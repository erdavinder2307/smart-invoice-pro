import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../components/Layout/MainLayout";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Checkbox,
  FormGroup,
  FormLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BreakfastDiningIcon from "@mui/icons-material/BreakfastDining";
import BrushIcon from "@mui/icons-material/Brush";
import BusinessIcon from "@mui/icons-material/Business";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import ExtensionIcon from "@mui/icons-material/Extension";
import HistoryIcon from "@mui/icons-material/History";
import HubIcon from "@mui/icons-material/Hub";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { C, fieldSx } from "../components/common/formStyles";
import {
  getIntegrationSettings,
  saveIntegrationSettings,
} from "../services/integrationSettingsService";

// ── Constants ─────────────────────────────────────────────────────────────────
const SUPPORTED_EVENTS = [
  { id: "invoice.created", label: "Invoice Created" },
  { id: "invoice.paid",    label: "Invoice Paid" },
  { id: "customer.created", label: "Customer Created" },
];

// ── Settings sub-nav (shared across all settings pages) ───────────────────────
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
                primaryTypographyProps={{
                  fontSize: "0.8125rem",
                  fontWeight: active ? 600 : 400,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
}

// ── Section card wrapper ───────────────────────────────────────────────────────
function SectionCard({ icon, title, subtitle, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${C.border}`,
        borderRadius: "4px",
        bgcolor: C.white,
        mb: 3,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${C.divider}`,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: C.sectionBg,
        }}
      >
        <Box sx={{ color: C.primary }}>{icon}</Box>
        <Box>
          <Typography sx={{ fontSize: "0.9375rem", fontWeight: 600, color: C.label }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: "0.75rem", color: C.hint, mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Paper>
  );
}

// ── Status chip ───────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const map = {
    connected:    { label: "Connected",    color: "success" },
    pending:      { label: "Pending",      color: "warning" },
    disconnected: { label: "Disconnected", color: "default" },
  };
  const cfg = map[status] || map.disconnected;
  return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600, fontSize: "0.75rem" }} />;
}

// ── Secret field (shows masked value, clears to allow re-entry) ───────────────
function SecretField({ label, value, onChange, helperText }) {
  const [visible, setVisible] = useState(false);
  const isMasked = value && value.startsWith("••••");
  return (
    <TextField
      fullWidth
      label={label}
      type={visible ? "text" : "password"}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      helperText={isMasked ? "Leave unchanged to keep current value" : helperText}
      sx={fieldSx}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => setVisible((v) => !v)} edge="end">
              {visible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

// ── Webhook row ───────────────────────────────────────────────────────────────
function WebhookRow({ wh, index, onChange, onRemove }) {
  const handleEventToggle = (eventId) => {
    const cur = wh.events || [];
    const next = cur.includes(eventId)
      ? cur.filter((e) => e !== eventId)
      : [...cur, eventId];
    onChange(index, "events", next);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${C.border}`,
        borderRadius: "4px",
        p: 2,
        mb: 2,
        bgcolor: C.sectionBg,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
        <TextField
          label="Webhook URL"
          value={wh.url || ""}
          onChange={(e) => onChange(index, "url", e.target.value)}
          sx={{ ...fieldSx, flex: "1 1 300px", minWidth: 220 }}
          placeholder="https://your-endpoint.com/webhook"
          size="small"
        />
        <FormControlLabel
          sx={{ mt: 0.5, flexShrink: 0 }}
          control={
            <Switch
              checked={wh.active !== false}
              onChange={(e) => onChange(index, "active", e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography sx={{ fontSize: "0.8125rem", color: C.label }}>Active</Typography>
          }
        />
        <Tooltip title="Remove webhook">
          <IconButton
            size="small"
            onClick={() => onRemove(index)}
            sx={{ mt: 0.5, color: C.hint, "&:hover": { color: "#d32f2f" } }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <FormLabel sx={{ fontSize: "0.75rem", color: C.hint, display: "block", mb: 0.5 }}>
          Events to receive
        </FormLabel>
        <FormGroup row>
          {SUPPORTED_EVENTS.map((ev) => (
            <FormControlLabel
              key={ev.id}
              control={
                <Checkbox
                  size="small"
                  checked={(wh.events || []).includes(ev.id)}
                  onChange={() => handleEventToggle(ev.id)}
                />
              }
              label={
                <Typography sx={{ fontSize: "0.8125rem" }}>{ev.label}</Typography>
              }
            />
          ))}
        </FormGroup>
      </Box>
    </Paper>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function IntegrationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [toast, setToast]     = useState({ open: false, message: "", severity: "success" });

  // ── State per section ──────────────────────────────────────────────────────
  const [payments, setPayments] = useState({
    provider: "zoho",
    enabled: false,
    api_key: "",
    webhook_secret: "",
    status: "disconnected",
  });
  const [banking, setBanking] = useState({ enabled: false, provider: null });
  const [email, setEmail]     = useState({ provider: "azure", sender_email: "", enabled: true });
  const [webhooks, setWebhooks] = useState([]);

  const showToast = (message, severity = "success") =>
    setToast({ open: true, message, severity });

  // ── Load ───────────────────────────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getIntegrationSettings();
      if (data.payments)  setPayments(data.payments);
      if (data.banking)   setBanking(data.banking);
      if (data.email)     setEmail(data.email);
      if (data.webhooks)  setWebhooks(data.webhooks);
    } catch {
      setError("Failed to load integration settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // ── Webhook helpers ────────────────────────────────────────────────────────
  const addWebhook = () => {
    setWebhooks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), url: "", events: ["invoice.created"], active: true },
    ]);
  };

  const updateWebhook = (index, field, value) => {
    setWebhooks((prev) =>
      prev.map((wh, i) => (i === index ? { ...wh, [field]: value } : wh))
    );
  };

  const removeWebhook = (index) => {
    setWebhooks((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await saveIntegrationSettings({ payments, banking, email, webhooks });
      showToast("Integration settings saved.");
      // Reload to get fresh masked values from server
      await loadSettings();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: 3,
        }}
      >
        {/* Content */}
        <Box sx={{ minWidth: 0 }}>
          {/* Header */}
          <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: C.label }}>
                Integrations
              </Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: C.hint, mt: 0.25 }}>
                Manage external services, webhooks, and API connections.
              </Typography>
            </Box>
            <Button
              variant="contained"
              disableElevation
              onClick={handleSave}
              disabled={saving || loading}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ textTransform: "none", fontWeight: 600, px: 3 }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          ) : (
            <>
              {/* ── 1. Payments ────────────────────────────────────────── */}
              <SectionCard
                icon={<BreakfastDiningIcon />}
                title="Payments"
                subtitle="Configure your payment provider to accept online payments."
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={payments.enabled}
                        onChange={(e) =>
                          setPayments((p) => ({ ...p, enabled: e.target.checked }))
                        }
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                        Enable Zoho Payments
                      </Typography>
                    }
                  />
                  <StatusChip status={payments.status} />
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <SecretField
                    label="API Key"
                    value={payments.api_key}
                    onChange={(v) => setPayments((p) => ({ ...p, api_key: v }))}
                    helperText="Your Zoho Payments API key"
                  />
                  <SecretField
                    label="Webhook Secret"
                    value={payments.webhook_secret}
                    onChange={(v) => setPayments((p) => ({ ...p, webhook_secret: v }))}
                    helperText="Used to verify incoming Zoho webhooks"
                  />
                </Box>

                {payments.enabled && !payments.api_key?.startsWith("••") && !payments.api_key && (
                  <Alert severity="warning" sx={{ mt: 2, fontSize: "0.8125rem" }}>
                    Enter your API key to complete the connection.
                  </Alert>
                )}
              </SectionCard>

              {/* ── 2. Banking ─────────────────────────────────────────── */}
              <SectionCard
                icon={<HubIcon />}
                title="Banking"
                subtitle="Connect your bank accounts for automatic transaction import."
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={banking.enabled}
                      onChange={(e) =>
                        setBanking((b) => ({ ...b, enabled: e.target.checked }))
                      }
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      Enable Bank Integration
                    </Typography>
                  }
                />

                {banking.enabled && (
                  <Alert severity="info" sx={{ mt: 2, fontSize: "0.8125rem" }}>
                    Bank API provider configuration will be available in a future update. Your
                    setting is saved and will activate automatically once a provider is configured.
                  </Alert>
                )}
              </SectionCard>

              {/* ── 3. Email ───────────────────────────────────────────── */}
              <SectionCard
                icon={<EmailIcon />}
                title="Email"
                subtitle="Outgoing email settings for invoices, reminders, and notifications."
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={email.enabled}
                        onChange={(e) => setEmail((em) => ({ ...em, enabled: e.target.checked }))}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                        Enable Email Sending
                      </Typography>
                    }
                  />
                  <Chip
                    label={email.provider || "azure"}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: "capitalize", fontSize: "0.75rem" }}
                  />
                </Box>

                <Divider sx={{ mb: 2 }} />

                <TextField
                  fullWidth
                  label="Sender Email Address"
                  value={email.sender_email || ""}
                  onChange={(e) => setEmail((em) => ({ ...em, sender_email: e.target.value }))}
                  sx={{ ...fieldSx, maxWidth: 400 }}
                  helperText="Emails will be sent from this address (configured in Azure Communication Services)"
                />
              </SectionCard>

              {/* ── 4. Webhooks ────────────────────────────────────────── */}
              <SectionCard
                icon={<BreakfastDiningIcon />}
                title="Webhooks"
                subtitle="Notify external services when events happen in Solidev Books."
              >
                {webhooks.length === 0 && (
                  <Typography sx={{ fontSize: "0.875rem", color: C.hint, mb: 2 }}>
                    No webhooks configured. Add one to receive real-time event notifications.
                  </Typography>
                )}

                {webhooks.map((wh, idx) => (
                  <WebhookRow
                    key={wh.id || idx}
                    wh={wh}
                    index={idx}
                    onChange={updateWebhook}
                    onRemove={removeWebhook}
                  />
                ))}

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addWebhook}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    borderColor: C.primary,
                    color: C.primary,
                  }}
                >
                  Add Webhook
                </Button>

                {webhooks.length > 0 && (
                  <Alert severity="info" sx={{ mt: 2, fontSize: "0.8125rem" }}>
                    Supported events: {SUPPORTED_EVENTS.map((e) => e.label).join(", ")}.
                    Payloads are signed with your payment webhook secret using HMAC-SHA256
                    (header: <code>X-SmartInvoice-Signature</code>).
                  </Alert>
                )}
              </SectionCard>
            </>
          )}
        </Box>
      </Box>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ fontSize: "0.875rem" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
