import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../components/Layout/MainLayout";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
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
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import BrushIcon from "@mui/icons-material/Brush";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ExtensionIcon from "@mui/icons-material/Extension";
import HistoryIcon from "@mui/icons-material/History";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useAuth } from "../context/AuthContext";
import { useBranding, BRANDING_DEFAULTS } from "../context/BrandingContext";
import {
  C,
  ZohoRow,
  fieldSx,
  footerSx,
  saveBtnSx,
} from "../components/common/formStyles";
import FormInput from "../components/common/FormInput";
import { getBranding, updateBranding } from "../services/brandingService";
import { uploadOrgLogo } from "../services/organizationProfileService";

// ── Settings sub-nav (shared with OrganizationProfile) ───────────────────────
const SETTINGS_NAV = [
  {
    label: "Organization Profile",
    path: "/settings/organization-profile",
    icon: <BusinessIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: "Branding",
    path: "/settings/branding",
    icon: <BrushIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: "Invoice Preferences",
    path: "/settings/invoice-preferences",
    icon: <DescriptionIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: "Taxes",
    path: "/settings/taxes",
    icon: <ReceiptLongIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: "User Management",
    path: "/settings/users",
    icon: <PeopleIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: "Roles",
    path: "/settings/roles",
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: "Automation",
    path: "/settings/automation",
    icon: <NotificationsActiveIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: "Integrations",
    path: "/settings/integrations",
    icon: <ExtensionIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: "Audit Log",
    path: "/settings/audit-log",
    icon: <HistoryIcon sx={{ fontSize: 18 }} />,
  },
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
      <List disablePadding>
        {SETTINGS_NAV.map(({ label, path, icon }) => {
          const isActive = pathname === path || pathname.startsWith(path);
          return (
            <ListItemButton
              key={path}
              onClick={() => navigate(path)}
              sx={{
                py: 0.875,
                px: 2,
                borderLeft: isActive
                  ? `3px solid ${C.primary}`
                  : "3px solid transparent",
                bgcolor: isActive ? "#e8f0fe" : "transparent",
                "&:hover": { bgcolor: isActive ? "#e8f0fe" : C.sectionBg },
              }}
            >
              <ListItemIcon
                sx={{ minWidth: 28, color: isActive ? C.primary : C.hint }}
              >
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontSize: "0.8125rem",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? C.primary : C.label,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ children }) {
  return (
    <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
      <Typography
        sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#333", textAlign: "left" }}
      >
        {children}
      </Typography>
    </Box>
  );
}

// ── Colour picker field ───────────────────────────────────────────────────────
// Combines a native <input type="color"> swatch with a hex TextField.
function ColorField({ label, value, onChange }) {
  const [localHex, setLocalHex] = useState(value || "");
  const HEX_RE = /^#[0-9a-fA-F]{6}$/;

  // Keep localHex in sync when parent changes (e.g. on Reset)
  useEffect(() => { setLocalHex(value || ""); }, [value]);

  const handleText = (e) => {
    const raw = e.target.value;
    setLocalHex(raw);
    if (HEX_RE.test(raw)) onChange(raw);
  };

  const handleSwatch = (e) => {
    const v = e.target.value;
    setLocalHex(v);
    onChange(v);
  };

  const isValid = HEX_RE.test(localHex);

  return (
    <TextField
      size="small"
      fullWidth
      value={localHex}
      onChange={handleText}
      placeholder="#2563EB"
      inputProps={{ maxLength: 7, style: { fontFamily: "monospace", fontSize: "0.875rem" } }}
      error={localHex.length > 0 && !isValid}
      helperText={localHex.length > 0 && !isValid ? "Enter a valid 6-digit hex, e.g. #2563EB" : " "}
      sx={fieldSx}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start" sx={{ mr: 0.5 }}>
            <Tooltip title="Pick a colour">
              <Box
                component="input"
                type="color"
                value={isValid ? localHex : "#000000"}
                onChange={handleSwatch}
                sx={{
                  width: 22,
                  height: 22,
                  border: `1px solid ${C.border}`,
                  borderRadius: "3px",
                  padding: 0,
                  cursor: "pointer",
                  flexShrink: 0,
                  appearance: "none",
                  backgroundColor: "transparent",
                  display: "block",
                }}
              />
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
}

// ── Live invoice preview ──────────────────────────────────────────────────────
function InvoicePreview({ primary, secondary, accent, orgName, logoUrl, showLogo }) {
  const pri = primary  || BRANDING_DEFAULTS.primary_color;
  const acc = accent   || BRANDING_DEFAULTS.accent_color;
  const name = orgName || "Your Company";

  return (
    <Box
      sx={{
        width: "100%",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "0.6875rem",
        color: "#222",
        userSelect: "none",
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          bgcolor: pri,
          color: "#fff",
          px: 2,
          py: 1.25,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "4px 4px 0 0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {showLogo && logoUrl && (
            <Box
              component="img"
              src={logoUrl}
              alt="logo"
              sx={{ height: 24, width: 24, objectFit: "contain", borderRadius: "2px" }}
            />
          )}
          <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#fff" }}>
            {name}
          </Typography>
        </Box>
        <Typography sx={{ fontWeight: 600, fontSize: "0.75rem", color: "rgba(255,255,255,0.85)" }}>
          INVOICE
        </Typography>
      </Box>

      {/* Body */}
      <Box sx={{ border: `1px solid ${C.border}`, borderTop: "none", px: 2, py: 1.5, bgcolor: "#fff" }}>
        {/* Bill to / details row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.6875rem", color: "#555", mb: 0.25 }}>BILL TO</Typography>
            <Typography sx={{ color: "#333" }}>John Doe</Typography>
            <Typography sx={{ color: C.hint }}>Invoice #: INV-001</Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ color: C.hint }}>Issue: 30 Mar 2026</Typography>
            <Typography sx={{ color: C.hint }}>Due: 14 Apr 2026</Typography>
          </Box>
        </Box>

        {/* Items table header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 60px 80px 80px",
            bgcolor: `${pri}14`,
            px: 1,
            py: 0.5,
            borderRadius: "2px",
          }}
        >
          {["Item", "Qty", "Rate", "Amount"].map((h) => (
            <Typography
              key={h}
              sx={{ fontSize: "0.625rem", fontWeight: 700, color: acc, textAlign: h !== "Item" ? "right" : "left" }}
            >
              {h}
            </Typography>
          ))}
        </Box>

        {/* Sample rows */}
        {[
          ["Web Design", "1", "₹5,000", "₹5,000"],
          ["Hosting", "12", "₹250", "₹3,000"],
        ].map(([item, qty, rate, amt], i) => (
          <Box
            key={i}
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 60px 80px 80px",
              px: 1,
              py: 0.375,
              borderBottom: `1px solid ${C.divider}`,
            }}
          >
            {[item, qty, rate, amt].map((cell, ci) => (
              <Typography
                key={ci}
                sx={{ fontSize: "0.6875rem", color: "#444", textAlign: ci !== 0 ? "right" : "left" }}
              >
                {cell}
              </Typography>
            ))}
          </Box>
        ))}

        {/* Total row */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1, pt: 1, borderTop: `2px solid ${acc}` }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", color: acc }}>
            Total: ₹8,000
          </Typography>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 1.5, pt: 1, borderTop: `1px solid ${C.divider}` }}>
          <Typography sx={{ fontSize: "0.5625rem", color: C.hint, textAlign: "center" }}>
            Thank you for your business · Solidev Books
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ── 1:1 Crop Dialog ──────────────────────────────────────────────────────────
const CROP_OUTPUT_PX = 512;
const MIN_CROP_SIZE = 60;
const SHADE = "rgba(0,0,0,0.55)";

// Absolute-position props + cursor for each corner handle
const CORNER_POS = {
  tl: { top: -6,    left: -6,   cursor: "nw-resize" },
  tr: { top: -6,    right: -6,  cursor: "ne-resize"  },
  bl: { bottom: -6, left: -6,   cursor: "sw-resize"  },
  br: { bottom: -6, right: -6,  cursor: "se-resize"  },
};

function CropDialog({ open, src, onClose, onCrop }) {
  const imgRef = useRef(null);
  const [box, setBox] = useState({ x: 0, y: 0, size: 0 });
  const [ready, setReady] = useState(false);

  const interaction = useRef(null);

  useEffect(() => {
    if (!open) {
      setReady(false);
      setBox({ x: 0, y: 0, size: 0 });
      interaction.current = null;
    }
  }, [open, src]);

  const initCrop = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    requestAnimationFrame(() => {
      const w = img.clientWidth;
      const h = img.clientHeight;
      if (!w || !h) return;
      const size = Math.floor(Math.min(w, h) * 0.85);
      setBox({
        x: Math.floor((w - size) / 2),
        y: Math.floor((h - size) / 2),
        size,
      });
      setReady(true);
    });
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      const act = interaction.current;
      if (!act || !imgRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const w = imgRef.current.clientWidth;
      const h = imgRef.current.clientHeight;
      const dx = clientX - act.mx;
      const dy = clientY - act.my;

      if (act.mode === "drag") {
        setBox((prev) => ({
          ...prev,
          x: Math.max(0, Math.min(w - prev.size, act.bx + dx)),
          y: Math.max(0, Math.min(h - prev.size, act.by + dy)),
        }));
        return;
      }

      const { corner, bx: obx, by: oby, size: osize } = act;
      let nx = obx, ny = oby, ns;

      if (corner === "br") {
        ns = osize + dx; nx = obx; ny = oby;
      } else if (corner === "tr") {
        ns = osize + dx; nx = obx; ny = oby + osize - ns;
      } else if (corner === "bl") {
        ns = osize - dx; nx = obx + osize - ns; ny = oby;
      } else {
        ns = osize - dx; nx = obx + osize - ns; ny = oby + osize - ns;
      }

      ns = Math.max(MIN_CROP_SIZE, ns);
      nx = Math.max(0, nx);
      ny = Math.max(0, ny);
      ns = Math.min(ns, w - nx, h - ny);
      ns = Math.max(MIN_CROP_SIZE, ns);

      setBox({ x: Math.round(nx), y: Math.round(ny), size: Math.round(ns) });
    };

    const onEnd = () => { interaction.current = null; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  const startDrag = (e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    interaction.current = { mode: "drag", mx: clientX, my: clientY, bx: box.x, by: box.y };
  };

  const startResize = (corner, e) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    interaction.current = {
      mode: "resize", corner,
      mx: clientX, my: clientY,
      bx: box.x, by: box.y, size: box.size,
    };
  };

  const handleCrop = () => {
    const img = imgRef.current;
    if (!img || !box.size) return;
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
    const canvas = document.createElement("canvas");
    canvas.width = CROP_OUTPUT_PX;
    canvas.height = CROP_OUTPUT_PX;
    canvas.getContext("2d").drawImage(
      img,
      Math.round(box.x * scaleX),
      Math.round(box.y * scaleY),
      Math.round(box.size * scaleX),
      Math.round(box.size * scaleY),
      0, 0,
      CROP_OUTPUT_PX,
      CROP_OUTPUT_PX
    );
    canvas.toBlob((blob) => {
      if (blob) onCrop(blob, URL.createObjectURL(blob));
    }, "image/jpeg", 0.92);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          fontSize: "0.9375rem",
          fontWeight: 600,
          py: 1.5,
          px: 2.5,
          borderBottom: `1px solid ${C.divider}`,
        }}
      >
        Crop Logo
        <Typography
          component="span"
          sx={{ fontSize: "0.75rem", fontWeight: 400, color: C.hint, ml: 1 }}
        >
          — drag to reposition · drag corners to resize
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: "hidden", bgcolor: "#111", lineHeight: 0 }}>
        <Box sx={{ position: "relative", display: "inline-block", width: "100%", lineHeight: 0 }}>
          <Box
            component="img"
            ref={imgRef}
            src={src || ""}
            alt=""
            onLoad={initCrop}
            draggable={false}
            sx={{
              display: "block",
              width: "100%",
              height: "auto",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />

          {ready && (
            <>
              <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: box.y, bgcolor: SHADE, pointerEvents: "none" }} />
              <Box sx={{ position: "absolute", top: box.y + box.size, left: 0, right: 0, bottom: 0, bgcolor: SHADE, pointerEvents: "none" }} />
              <Box sx={{ position: "absolute", top: box.y, left: 0, width: box.x, height: box.size, bgcolor: SHADE, pointerEvents: "none" }} />
              <Box sx={{ position: "absolute", top: box.y, left: box.x + box.size, right: 0, height: box.size, bgcolor: SHADE, pointerEvents: "none" }} />

              <Box
                sx={{
                  position: "absolute",
                  left: box.x,
                  top: box.y,
                  width: box.size,
                  height: box.size,
                  border: "2px solid rgba(255,255,255,0.85)",
                  cursor: "move",
                  userSelect: "none",
                  touchAction: "none",
                  boxSizing: "border-box",
                }}
                onMouseDown={startDrag}
                onTouchStart={startDrag}
              >
                {[33.33, 66.66].map((pct) => (
                  <React.Fragment key={pct}>
                    <Box sx={{ position: "absolute", left: `${pct}%`, top: 0, bottom: 0, width: "1px", bgcolor: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                    <Box sx={{ position: "absolute", top: `${pct}%`, left: 0, right: 0, height: "1px", bgcolor: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                  </React.Fragment>
                ))}

                {Object.entries(CORNER_POS).map(([corner, pos]) => (
                  <Box
                    key={corner}
                    sx={{
                      position: "absolute",
                      width: 12,
                      height: 12,
                      bgcolor: "white",
                      border: "1.5px solid rgba(0,0,0,0.35)",
                      borderRadius: "2px",
                      zIndex: 10,
                      cursor: pos.cursor,
                      touchAction: "none",
                      ...pos,
                    }}
                    onMouseDown={(e) => startResize(corner, e)}
                    onTouchStart={(e) => startResize(corner, e)}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${C.divider}` }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: "none", fontSize: "0.8125rem", color: C.hint }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCrop}
          disabled={!ready}
          sx={saveBtnSx}
        >
          Crop &amp; Use
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Default form shapes ───────────────────────────────────────────────────────
const EMPTY_FORM = {
  primary_color:   BRANDING_DEFAULTS.primary_color,
  secondary_color: BRANDING_DEFAULTS.secondary_color,
  accent_color:    BRANDING_DEFAULTS.accent_color,
  email_header_logo_url: "",
  invoice_template_settings: { show_logo: true, show_signature: false },
};

// ── Page component ────────────────────────────────────────────────────────────
export default function BrandingSettings() {
  const { isAdmin } = useAuth();
  const { branding: ctxBranding, setBranding: setCtxBranding } = useBranding();
  const navigate = useNavigate();

  const [form, setForm]       = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [logoFile, setLogoFile]       = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoError, setLogoError]     = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const fileInputRef = useRef(null);
  const pendingFile  = useRef(null);

  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  // Admin guard
  useEffect(() => {
    if (!isAdmin) navigate("/dashboard", { replace: true });
  }, [isAdmin, navigate]);

  // Load branding on mount
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const data = await getBranding();
        setForm({
          primary_color:         data.primary_color         || BRANDING_DEFAULTS.primary_color,
          secondary_color:       data.secondary_color       || BRANDING_DEFAULTS.secondary_color,
          accent_color:          data.accent_color          || BRANDING_DEFAULTS.accent_color,
          email_header_logo_url: data.email_header_logo_url || "",
          invoice_template_settings: {
            show_logo:      data.invoice_template_settings?.show_logo      ?? true,
            show_signature: data.invoice_template_settings?.show_signature ?? false,
          },
        });
        if (data.logo_url) setLogoPreview(data.logo_url);
      } catch {
        setToast({ open: true, message: "Failed to load branding settings.", severity: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  // ── Field helpers ─────────────────────────────────────────────────────────
  const setColor = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setIts = useCallback((field, value) => {
    setForm((prev) => ({
      ...prev,
      invoice_template_settings: { ...prev.invoice_template_settings, [field]: value },
    }));
  }, []);

  // ── Logo handling (same 1:1 crop flow as OrganizationProfile) ─────────────
  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      setLogoError("Only PNG, JPG, GIF, or WebP images are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLogoError("Logo must be smaller than 10 MB.");
      return;
    }
    setLogoError("");
    pendingFile.current = file;
    const reader = new FileReader();
    reader.onload = (ev) => { setCropSrc(ev.target.result); setCropOpen(true); };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (blob, previewUrl) => {
    setLogoFile(blob);
    setLogoPreview(previewUrl);
    setCropOpen(false);
  };

  const handleCropCancel = () => {
    pendingFile.current = null;
    setCropOpen(false);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoError("");
    pendingFile.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      let logo_url = ctxBranding.logo_url || "";

      // Upload new logo if selected
      if (logoFile) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(logoFile);
        });
        const result = await uploadOrgLogo({
          logo_filename: pendingFile.current?.name || "logo.jpg",
          logo_base64:   base64,
        });
        logo_url = result.logo_url;
        setLogoFile(null);
        pendingFile.current = null;
      }

      const payload = { ...form };
      if (logo_url) payload.logo_url = logo_url;

      const saved = await updateBranding(payload);

      // Push new branding into global context so theme updates instantly
      setCtxBranding((prev) => ({ ...prev, ...saved }));

      setToast({ open: true, message: "Branding updated successfully.", severity: "success" });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to save branding.";
      setToast({ open: true, message: msg, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      primary_color:   BRANDING_DEFAULTS.primary_color,
      secondary_color: BRANDING_DEFAULTS.secondary_color,
      accent_color:    BRANDING_DEFAULTS.accent_color,
      email_header_logo_url: form.email_header_logo_url,
      invoice_template_settings: BRANDING_DEFAULTS.invoice_template_settings,
    });
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <MainLayout title="Branding Settings">
        <Box sx={{ bgcolor: C.pageBg, minHeight: "100vh" }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Branding Settings">
      <Box sx={{ bgcolor: C.pageBg, minHeight: "100vh", pb: 6 }}>
        <Container maxWidth={false} sx={{ pt: 3, px: 2.5 }}>
          <Box sx={{ minWidth: 0 }}>

              {/* ── Form card ─────────────────────────────────────────────── */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  {/* ══ LOGO ════════════════════════════════════════════════ */}
                  <Box sx={{ px: 3 }}>
                    <SectionHeader>Logo</SectionHeader>

                    <ZohoRow
                      label="Organization Logo"
                      hint="PNG, JPG, GIF or WebP. Max 10 MB. Recommended: square logo. Used in invoice header and email."
                      noDivider
                      alignStart
                    >
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                        {/* Preview */}
                        <Box
                          sx={{
                            width: 72,
                            height: 72,
                            border: `1px solid ${C.border}`,
                            borderRadius: "4px",
                            overflow: "hidden",
                            bgcolor: C.sectionBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {logoPreview ? (
                            <Box
                              component="img"
                              src={logoPreview}
                              alt="Logo preview"
                              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                          ) : (
                            <BusinessIcon sx={{ fontSize: 36, color: C.hint }} />
                          )}
                        </Box>

                        {/* Upload controls */}
                        <Box>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                            style={{ display: "none" }}
                            onChange={handleLogoSelect}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CloudUploadIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{
                              textTransform: "none",
                              fontSize: "0.8125rem",
                              borderRadius: "4px",
                              borderColor: C.border,
                              color: "#555",
                              "&:hover": { borderColor: C.primary },
                            }}
                          >
                            {logoPreview ? "Change Logo" : "Upload Logo"}
                          </Button>

                          {logoPreview && (
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={removeLogo}
                              sx={{
                                ml: 1,
                                textTransform: "none",
                                fontSize: "0.8125rem",
                                color: C.hint,
                                "&:hover": { color: "#d93025" },
                              }}
                            >
                              Remove
                            </Button>
                          )}

                          {logoError && (
                            <Typography sx={{ fontSize: "0.75rem", color: C.red, mt: 0.75, display: "block" }}>
                              {logoError}
                            </Typography>
                          )}
                          {logoFile && !logoError && (
                            <Typography sx={{ fontSize: "0.75rem", color: C.hint, mt: 0.75, display: "block" }}>
                              {logoFile.name} — {(logoFile.size / 1024).toFixed(1)} KB
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </ZohoRow>
                  </Box>

                  {/* ══ COLOUR SETTINGS ═════════════════════════════════════ */}
                  <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
                    <SectionHeader>Colour Settings</SectionHeader>

                    <ZohoRow
                      label="Primary Colour"
                      hint="Used for buttons, links, and UI highlights."
                    >
                      <ColorField
                        label="Primary Colour"
                        value={form.primary_color}
                        onChange={(v) => setColor("primary_color", v)}
                      />
                    </ZohoRow>

                    <ZohoRow
                      label="Secondary Colour"
                      hint="Used for success states and secondary actions."
                    >
                      <ColorField
                        label="Secondary Colour"
                        value={form.secondary_color}
                        onChange={(v) => setColor("secondary_color", v)}
                      />
                    </ZohoRow>

                    <ZohoRow
                      label="Accent Colour"
                      hint="Used in invoice PDF headers, table highlights, and totals."
                      noDivider
                    >
                      <ColorField
                        label="Accent Colour"
                        value={form.accent_color}
                        onChange={(v) => setColor("accent_color", v)}
                      />
                    </ZohoRow>
                  </Box>

                  {/* ══ INVOICE TEMPLATE ════════════════════════════════════ */}
                  <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
                    <SectionHeader>Invoice Template</SectionHeader>

                    <ZohoRow label="Show Logo on Invoice">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={form.invoice_template_settings.show_logo}
                            onChange={(e) => setIts("show_logo", e.target.checked)}
                            size="small"
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: "0.8125rem", color: C.label }}>
                            {form.invoice_template_settings.show_logo ? "Visible" : "Hidden"}
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </ZohoRow>

                    <ZohoRow label="Show Signature Block" noDivider>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={form.invoice_template_settings.show_signature}
                            onChange={(e) => setIts("show_signature", e.target.checked)}
                            size="small"
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: "0.8125rem", color: C.label }}>
                            {form.invoice_template_settings.show_signature ? "Visible" : "Hidden"}
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </ZohoRow>
                  </Box>

                  {/* ══ EMAIL SETTINGS ══════════════════════════════════════ */}
                  <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
                    <SectionHeader>Email Header</SectionHeader>

                    <FormInput
                      label="Email Header Logo URL"
                      hint="Override the logo URL used in outgoing invoice emails. Leave blank to use the organization logo."
                      noDivider
                      value={form.email_header_logo_url}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, email_header_logo_url: e.target.value }))
                      }
                      placeholder="https://cdn.example.com/logo.png"
                    />
                  </Box>

                  {/* ══ FOOTER ══════════════════════════════════════════════ */}
                  <Box sx={footerSx}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                      onClick={() => setPreviewOpen(true)}
                      sx={{
                        textTransform: "none",
                        fontSize: "0.8125rem",
                        borderRadius: "4px",
                        borderColor: C.border,
                        color: C.label,
                        mr: "auto",
                        "&:hover": { borderColor: C.primary, color: C.primary },
                      }}
                    >
                      Preview Invoice
                    </Button>

                    <Button
                      variant="text"
                      size="small"
                      startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                      onClick={handleReset}
                      sx={{
                        textTransform: "none",
                        fontSize: "0.8125rem",
                        color: C.hint,
                        mr: 1,
                        "&:hover": { color: C.label },
                      }}
                    >
                      Reset to Defaults
                    </Button>

                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                      sx={saveBtnSx}
                    >
                      {saving ? "Saving…" : "Save Branding"}
                    </Button>
                  </Box>
                </Paper>
              </Box>

          </Box>
        </Container>
      </Box>

      <CropDialog
        open={cropOpen}
        src={cropSrc}
        onClose={handleCropCancel}
        onCrop={handleCropComplete}
      />

      <Drawer
        anchor="right"
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: "75%" }, p: 3, bgcolor: C.pageBg } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>Invoice Preview</Typography>
          <IconButton onClick={() => setPreviewOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <InvoicePreview
          primary={form.primary_color}
          secondary={form.secondary_color}
          accent={form.accent_color}
          orgName={ctxBranding.organization_name}
          logoUrl={logoPreview || ctxBranding.logo_url}
          showLogo={form.invoice_template_settings.show_logo}
        />
      </Drawer>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
