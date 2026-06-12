import React, { useCallback, useEffect, useRef, useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Checkbox,
  FormGroup,
  FormLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EmailIcon from "@mui/icons-material/Email";
import HubIcon from "@mui/icons-material/Hub";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentsIcon from "@mui/icons-material/Payments";
import RefreshIcon from "@mui/icons-material/Refresh";
import UndoIcon from "@mui/icons-material/Undo";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SendIcon from "@mui/icons-material/Send";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { C, fieldSx, footerSx, saveBtnSx } from "../components/common/formStyles";
import {
  getIntegrationSettings,
  saveIntegrationSettings,
  sendTestEmail,
  getWebhookLogs,
} from "../services/integrationSettingsService";

// ── Supported webhook events (mirrors backend SUPPORTED_EVENTS) ───────────────
const SUPPORTED_EVENTS = [
  { id: "invoice.created",          label: "Invoice Created" },
  { id: "invoice.updated",          label: "Invoice Updated" },
  { id: "invoice.paid",             label: "Invoice Paid" },
  { id: "invoice.voided",           label: "Invoice Voided" },
  { id: "quote.created",            label: "Quote Created" },
  { id: "quote.accepted",           label: "Quote Accepted" },
  { id: "quote.converted",          label: "Quote Converted" },
  { id: "customer.created",         label: "Customer Created" },
  { id: "customer.updated",         label: "Customer Updated" },
  { id: "bank_import.completed",    label: "Bank Import Completed" },
  { id: "reconciliation.completed", label: "Reconciliation Completed" },
];

// ── Section card wrapper ───────────────────────────────────────────────────────
function SectionCard({ icon, title, subtitle, badge, children }) {
  return (
    <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: "4px", bgcolor: C.white, mb: 3, overflow: "hidden" }}>
      <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${C.divider}`, display: "flex", alignItems: "center", gap: 1.5, bgcolor: C.sectionBg }}>
        <Box sx={{ color: C.primary }}>{icon}</Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "0.9375rem", fontWeight: 600, color: C.label }}>{title}</Typography>
            {badge}
          </Box>
          {subtitle && <Typography sx={{ fontSize: "0.75rem", color: C.hint, mt: 0.25 }}>{subtitle}</Typography>}
        </Box>
      </Box>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Paper>
  );
}

// ── Category header ───────────────────────────────────────────────────────────
function CategoryHeader({ title }) {
  return (
    <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: C.hint, letterSpacing: "0.08em", textTransform: "uppercase", mb: 1.5, mt: 1 }}>
      {title}
    </Typography>
  );
}

// ── Coming Soon card ──────────────────────────────────────────────────────────
function ComingSoonCard({ icon, title, subtitle, items }) {
  return (
    <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: "4px", bgcolor: "#fafafa", mb: 3, overflow: "hidden" }}>
      <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${C.divider}`, display: "flex", alignItems: "center", gap: 1.5, bgcolor: "#f5f5f5" }}>
        <Box sx={{ color: C.hint }}>{icon}</Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "0.9375rem", fontWeight: 600, color: C.hint }}>{title}</Typography>
            <Chip label="Coming Soon" size="small" sx={{ fontSize: "0.6875rem", height: 20, bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 600 }} />
          </Box>
          {subtitle && <Typography sx={{ fontSize: "0.75rem", color: C.hint, mt: 0.25 }}>{subtitle}</Typography>}
        </Box>
      </Box>
      <Box sx={{ p: 3 }}>
        <Typography sx={{ fontSize: "0.8125rem", color: C.hint, mb: 1.5 }}>Planned providers:</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {items.map((item) => (
            <Chip key={item} label={item} size="small" variant="outlined" sx={{ fontSize: "0.75rem", color: C.hint, borderColor: C.border }} />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

// ── Secret field ──────────────────────────────────────────────────────────────
function SecretField({ label, value, onChange, helperText, placeholder }) {
  const [visible, setVisible] = useState(false);
  const isMasked = value && value.startsWith("\u2022\u2022\u2022\u2022");
  return (
    <TextField
      fullWidth
      label={label}
      type={visible ? "text" : "password"}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      helperText={isMasked ? "Leave unchanged to keep current value" : helperText}
      placeholder={placeholder}
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
    const next = cur.includes(eventId) ? cur.filter((e) => e !== eventId) : [...cur, eventId];
    onChange(index, "events", next);
  };
  return (
    <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: "4px", p: 2, mb: 2, bgcolor: C.sectionBg }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
        <TextField
          label="Webhook URL"
          value={wh.url || ""}
          onChange={(e) => onChange(index, "url", e.target.value)}
          sx={{ ...fieldSx, flex: "1 1 300px", minWidth: 220 }}
          placeholder="https://your-endpoint.com/webhook"
          size="small"
          helperText="Must use https://"
        />
        <FormControlLabel
          sx={{ mt: 0.5, flexShrink: 0 }}
          control={<Switch checked={wh.active !== false} onChange={(e) => onChange(index, "active", e.target.checked)} size="small" />}
          label={<Typography sx={{ fontSize: "0.8125rem", color: C.label }}>Active</Typography>}
        />
        <Tooltip title="Remove webhook">
          <IconButton size="small" onClick={() => onRemove(index)} sx={{ mt: 0.5, color: C.hint, "&:hover": { color: "#d32f2f" } }}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ mt: 1.5 }}>
        <FormLabel sx={{ fontSize: "0.75rem", color: C.hint, display: "block", mb: 0.5 }}>Events to receive</FormLabel>
        <FormGroup row>
          {SUPPORTED_EVENTS.map((ev) => (
            <FormControlLabel
              key={ev.id}
              control={<Checkbox size="small" checked={(wh.events || []).includes(ev.id)} onChange={() => handleEventToggle(ev.id)} />}
              label={<Typography sx={{ fontSize: "0.8125rem" }}>{ev.label}</Typography>}
            />
          ))}
        </FormGroup>
      </Box>
      <Box sx={{ mt: 1.5 }}>
        <SecretField
          label="Signing Secret (optional)"
          value={wh.secret || ""}
          onChange={(v) => onChange(index, "secret", v)}
          helperText="Used to sign payloads with HMAC-SHA256 (X-SmartInvoice-Signature header)"
          placeholder="Enter a secret to enable payload signing"
        />
      </Box>
    </Paper>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function IntegrationSettings() {
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [toast, setToast]             = useState({ open: false, message: "", severity: "success" });
  const [testEmailTo, setTestEmailTo] = useState("");
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [logsOpen, setLogsOpen]       = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  const [email, setEmail]       = useState({ provider: "azure", sender_email: "", sender_name: "Solidev Books", enabled: true });
  const [webhooks, setWebhooks] = useState([]);

  const savedEmail    = useRef(null);
  const savedWebhooks = useRef(null);

  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getIntegrationSettings();
      if (data.email)    { setEmail(data.email);       savedEmail.current    = data.email; }
      if (data.webhooks) { setWebhooks(data.webhooks); savedWebhooks.current = data.webhooks; }
    } catch {
      setError("Failed to load integration settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const addWebhook    = () => setWebhooks((prev) => [...prev, { id: crypto.randomUUID(), url: "", events: ["invoice.created"], active: true, secret: "" }]);
  const updateWebhook = (index, field, value) => setWebhooks((prev) => prev.map((wh, i) => (i === index ? { ...wh, [field]: value } : wh)));
  const removeWebhook = (index) => setWebhooks((prev) => prev.filter((_, i) => i !== index));

  const handleTestEmail = async () => {
    const to = testEmailTo.trim() || email.sender_email;
    if (!to || !to.includes("@")) { showToast("Enter a valid email address to test.", "error"); return; }
    setTestEmailSending(true);
    try {
      await sendTestEmail(to);
      showToast(`Test email sent to ${to}.`);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to send test email.", "error");
    } finally {
      setTestEmailSending(false);
    }
  };

  const handleLoadLogs = async () => {
    setLogsLoading(true);
    try {
      const logs = await getWebhookLogs();
      setWebhookLogs(logs);
      setLogsOpen(true);
    } catch {
      showToast("Failed to load webhook logs.", "error");
    } finally {
      setLogsLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveIntegrationSettings({ email, webhooks });
      savedEmail.current    = email;
      savedWebhooks.current = webhooks;
      showToast("Integration settings saved.");
      await loadSettings();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (savedEmail.current !== null)    setEmail(savedEmail.current);
    if (savedWebhooks.current !== null) setWebhooks(savedWebhooks.current);
  };

  return (
    <MainLayout title="Integrations">
      <Box sx={{ bgcolor: C.pageBg, minHeight: "100vh", pb: 6 }}>
        <Container maxWidth={false} sx={{ pt: 3, px: 2.5 }}>
          <Box sx={{ minWidth: 0 }}>

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: C.label }}>Integrations</Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: C.hint, mt: 0.25 }}>Manage external services, webhooks, and API connections.</Typography>
            </Box>

            {loading ? (
              <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            ) : (
              <>
                {/* ── COMMUNICATION ─────────────────────────────── */}
                <CategoryHeader title="Communication" />

                <SectionCard
                  icon={<EmailIcon />}
                  title="Email"
                  subtitle="Outgoing email for invoices, quotes, reminders, and notifications."
                  badge={<Chip label={email.provider || "azure"} size="small" color="success" variant="outlined" sx={{ textTransform: "capitalize", fontSize: "0.7rem", height: 18 }} />}
                >
                  <FormControlLabel
                    sx={{ mb: 2 }}
                    control={<Switch checked={email.enabled} onChange={(e) => setEmail((em) => ({ ...em, enabled: e.target.checked }))} />}
                    label={<Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>Enable Email Sending</Typography>}
                  />
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Sender Email Address"
                      value={email.sender_email || ""}
                      onChange={(e) => setEmail((em) => ({ ...em, sender_email: e.target.value }))}
                      sx={fieldSx}
                      helperText="Emails sent from this address (Azure Communication Services)"
                    />
                    <TextField
                      fullWidth
                      label="Sender Display Name"
                      value={email.sender_name || ""}
                      onChange={(e) => setEmail((em) => ({ ...em, sender_name: e.target.value }))}
                      sx={fieldSx}
                      helperText="Name shown as the email sender (e.g. Acme Corp)"
                    />
                  </Box>
                  <Box sx={{ mt: 2, display: "flex", alignItems: "flex-end", gap: 1, flexWrap: "wrap" }}>
                    <TextField
                      label="Send Test Email To"
                      size="small"
                      value={testEmailTo}
                      onChange={(e) => setTestEmailTo(e.target.value)}
                      placeholder={email.sender_email || "you@example.com"}
                      sx={{ width: 280 }}
                      helperText="Defaults to sender email if left blank"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={testEmailSending ? <CircularProgress size={14} color="inherit" /> : <SendIcon sx={{ fontSize: 16 }} />}
                      onClick={handleTestEmail}
                      disabled={testEmailSending || !email.enabled}
                      sx={{ textTransform: "none", fontSize: "0.8125rem", mb: "20px" }}
                    >
                      {testEmailSending ? "Sending\u2026" : "Send Test Email"}
                    </Button>
                  </Box>
                </SectionCard>

                <ComingSoonCard icon={<EmailIcon />} title="SMS" subtitle="Payment reminders and alerts via SMS." items={["Twilio", "MSG91", "AWS SNS"]} />

                {/* ── DATA IMPORT ───────────────────────────────── */}
                <CategoryHeader title="Data Import" />

                <SectionCard icon={<AccountBalanceIcon />} title="Bank Statement Import" subtitle="Import and reconcile bank transactions from downloaded statements.">
                  <Box sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: C.label, mb: 0.5 }}>Supported formats</Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {["CSV", "XLSX", "XLS", "PDF"].map((fmt) => (
                        <Chip key={fmt} label={fmt} size="small" color="success" variant="outlined" sx={{ fontSize: "0.75rem" }} />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: C.label, mb: 0.5 }}>AI-Assisted Parsing</Typography>
                    <Typography sx={{ fontSize: "0.8125rem", color: C.hint }}>
                      Powered by Claude (Anthropic) \u2014 automatically extracts transactions from any Indian bank format (SBI, HDFC, ICICI, Axis, PNB, Kotak, and more).
                    </Typography>
                  </Box>
                  <Alert severity="info" sx={{ mt: 1, fontSize: "0.8125rem" }}>
                    Bank import is available in <strong>Reconciliation \u2192 Import Statement</strong>. Transactions are automatically matched to invoices and expenses using AI.
                  </Alert>
                </SectionCard>

                {/* ── AUTOMATION ────────────────────────────────── */}
                <CategoryHeader title="Automation" />

                <SectionCard icon={<HubIcon />} title="Webhooks" subtitle="Notify external services when events happen in Solidev Books.">
                  {webhooks.length === 0 && (
                    <Typography sx={{ fontSize: "0.875rem", color: C.hint, mb: 2 }}>No webhooks configured. Add one to receive real-time event notifications.</Typography>
                  )}
                  {webhooks.map((wh, idx) => (
                    <WebhookRow key={wh.id || idx} wh={wh} index={idx} onChange={updateWebhook} onRemove={removeWebhook} />
                  ))}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addWebhook}
                      sx={{ textTransform: "none", fontSize: "0.8125rem", fontWeight: 500, borderColor: C.primary, color: C.primary }}
                    >
                      Add Webhook
                    </Button>
                    {webhooks.length > 0 && (
                      <Button
                        variant="text"
                        size="small"
                        startIcon={logsLoading ? <CircularProgress size={14} color="inherit" /> : <HistoryIcon sx={{ fontSize: 16 }} />}
                        onClick={handleLoadLogs}
                        disabled={logsLoading}
                        sx={{ textTransform: "none", fontSize: "0.8125rem", color: C.hint }}
                      >
                        {logsLoading ? "Loading\u2026" : "View Delivery Log"}
                      </Button>
                    )}
                  </Box>
                  {logsOpen && webhookLogs.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: C.label, mb: 1 }}>Recent Deliveries (last 50)</Typography>
                      <Box sx={{ border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "auto" }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: C.sectionBg }}>
                              <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600 }}>Event</TableCell>
                              <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600 }}>URL</TableCell>
                              <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600 }}>Status</TableCell>
                              <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600 }}>Time</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {webhookLogs.map((log) => (
                              <TableRow key={log.id} hover>
                                <TableCell sx={{ fontSize: "0.75rem" }}>
                                  <Chip label={log.event} size="small" sx={{ fontSize: "0.7rem", height: 18 }} />
                                </TableCell>
                                <TableCell sx={{ fontSize: "0.75rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.url}</TableCell>
                                <TableCell sx={{ fontSize: "0.75rem" }}>
                                  {log.success ? (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "success.main" }}>
                                      <CheckCircleOutlineIcon sx={{ fontSize: 14 }} /><span>{log.status_code}</span>
                                    </Box>
                                  ) : (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "error.main" }}>
                                      <ErrorOutlineIcon sx={{ fontSize: 14 }} /><span>{log.error || "Failed"}</span>
                                    </Box>
                                  )}
                                </TableCell>
                                <TableCell sx={{ fontSize: "0.75rem", color: C.hint, whiteSpace: "nowrap" }}>
                                  {log.delivered_at ? new Date(log.delivered_at).toLocaleString() : "\u2014"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Box>
                  )}
                  {logsOpen && webhookLogs.length === 0 && (
                    <Alert severity="info" sx={{ mt: 2, fontSize: "0.8125rem" }}>No webhook deliveries recorded yet.</Alert>
                  )}
                </SectionCard>

                {/* ── FINANCIAL CONNECTIONS — Coming Soon ──────── */}
                <CategoryHeader title="Financial Connections" />

                <ComingSoonCard
                  icon={<PaymentsIcon />}
                  title="Payment Providers"
                  subtitle="Accept online payments directly from invoices."
                  items={["Razorpay", "Cashfree", "Stripe", "Zoho Payments", "PayPal"]}
                />
                <ComingSoonCard
                  icon={<AccountBalanceIcon />}
                  title="Bank Connectivity"
                  subtitle="Automatic bank feed sync via regulated data APIs."
                  items={["Account Aggregator (RBI AA)", "Decentro", "Setu"]}
                />

                {/* ── FOOTER ───────────────────────────────────── */}
                <Box sx={footerSx}>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<UndoIcon sx={{ fontSize: 16 }} />}
                    onClick={handleDiscard}
                    disabled={saving}
                    sx={{ textTransform: "none", fontSize: "0.8125rem", color: C.hint, mr: 1, "&:hover": { color: C.label } }}
                  >
                    Discard Changes
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSave}
                    disabled={saving || loading}
                    startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                    sx={saveBtnSx}
                  >
                    {saving ? "Saving\u2026" : "Save Changes"}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Container>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} sx={{ fontSize: "0.875rem" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
