import React, { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../components/Layout/MainLayout";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
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
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";

import { useAuth } from "../context/AuthContext";
import {
  C,
  ZohoRow,
  fieldSx,
  footerSx,
  saveBtnSx,
} from "../components/common/formStyles";
import {
  getOrgProfile,
  updateOrgProfile,
  uploadOrgLogo,
} from "../services/organizationProfileService";

// ── Static dropdown options ───────────────────────────────────────────────────
const INDUSTRIES = [
  "Accounting / Finance",
  "Agriculture",
  "Automotive",
  "Construction",
  "Education",
  "Healthcare",
  "Hospitality & Food Service",
  "Legal",
  "Manufacturing",
  "Real Estate",
  "Retail",
  "Technology",
  "Telecommunications",
  "Transportation & Logistics",
  "Other",
];

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Singapore",
  "United Arab Emirates",
  "Germany",
  "France",
  "Netherlands",
  "New Zealand",
  "South Africa",
  "Other",
];

// ── Settings sub-nav ──────────────────────────────────────────────────────────
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
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: `1px solid ${C.divider}`,
        }}
      >
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
                "&:hover": {
                  bgcolor: isActive ? "#e8f0fe" : C.sectionBg,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 28,
                  color: isActive ? C.primary : C.hint,
                }}
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

// ── Section header (matches AddEditExpense pattern) ───────────────────────────
function SectionHeader({ children }) {
  return (
    <Box
      sx={{
        py: 1.5,
        borderBottom: `1px solid ${C.divider}`,
      }}
    >
      <Typography
        sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#333", textAlign: "left" }}
      >
        {children}
      </Typography>
    </Box>
  );
}

// ── 1:1 Crop Dialog ─────────────────────────────────────────────────────────
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

  // Unified interaction ref — only one gesture active at a time.
  // mode "drag"  : { mode, mx, my, bx, by }
  // mode "resize": { mode, corner, mx, my, bx, by, size }
  const interaction = useRef(null);

  // Reset whenever the dialog opens with a new image
  useEffect(() => {
    if (!open) {
      setReady(false);
      setBox({ x: 0, y: 0, size: 0 });
      interaction.current = null;
    }
  }, [open, src]);

  // Centre crop box once image has painted
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

  // ── Unified global pointer tracking ───────────────────────────────────────
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

      // ── Resize: dx as primary axis, anchor = opposite corner ─────────────
      // br anchor=tl: right/bottom expand   → ns = osize + dx, nx=obx, ny=oby
      // tr anchor=bl: right expands, top up → ns = osize + dx, nx=obx, ny=oby+osize-ns
      // bl anchor=tr: left/bottom expand    → ns = osize - dx, nx=obx+osize-ns, ny=oby
      // tl anchor=br: left/top both move    → ns = osize - dx, nx=obx+osize-ns, ny=oby+osize-ns
      const { corner, bx: obx, by: oby, size: osize } = act;
      let nx = obx, ny = oby, ns;

      if (corner === "br") {
        ns = osize + dx;
        nx = obx;  ny = oby;
      } else if (corner === "tr") {
        ns = osize + dx;
        nx = obx;  ny = oby + osize - ns;
      } else if (corner === "bl") {
        ns = osize - dx;
        nx = obx + osize - ns;  ny = oby;
      } else { // tl
        ns = osize - dx;
        nx = obx + osize - ns;
        ny = oby + osize - ns;
      }

      // Clamp: min size, inside image bounds
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
    e.stopPropagation(); // don't also fire startDrag on the parent frame
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
          {/* Source image — pointer-events off so it doesn't interfere with dragging */}
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
              {/* Dark overlay — 4 surrounding panels */}
              <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: box.y, bgcolor: SHADE, pointerEvents: "none" }} />
              <Box sx={{ position: "absolute", top: box.y + box.size, left: 0, right: 0, bottom: 0, bgcolor: SHADE, pointerEvents: "none" }} />
              <Box sx={{ position: "absolute", top: box.y, left: 0, width: box.x, height: box.size, bgcolor: SHADE, pointerEvents: "none" }} />
              <Box sx={{ position: "absolute", top: box.y, left: box.x + box.size, right: 0, height: box.size, bgcolor: SHADE, pointerEvents: "none" }} />

              {/* Draggable + resizable crop frame */}
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
                {/* Rule-of-thirds guide lines */}
                {[33.33, 66.66].map((pct) => (
                  <React.Fragment key={pct}>
                    <Box sx={{ position: "absolute", left: `${pct}%`, top: 0, bottom: 0, width: "1px", bgcolor: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                    <Box sx={{ position: "absolute", top: `${pct}%`, left: 0, right: 0, height: "1px", bgcolor: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                  </React.Fragment>
                ))}

                {/* Corner resize handles */}
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

// ── Default form state ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  organization_name: "",
  industry: "",
  country: "",
  gstin: "",
  website_url: "",
  logo_url: "",
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    fax: "",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function OrganizationProfile() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoError, setLogoError] = useState("");
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState("");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const fileInputRef = useRef(null);
  const pendingFile = useRef(null);

  // Admin guard
  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAdmin, navigate]);

  // Load profile on mount
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const data = await getOrgProfile();
        setForm({
          organization_name: data.organization_name || "",
          industry: data.industry || "",
          country: data.country || "",
          gstin: data.gstin || "",
          website_url: data.website_url || "",
          logo_url: data.logo_url || "",
          address: {
            line1:   (data.address && data.address.line1)   || "",
            line2:   (data.address && data.address.line2)   || "",
            city:    (data.address && data.address.city)    || "",
            state:   (data.address && data.address.state)   || "",
            pincode: (data.address && data.address.pincode) || "",
            phone:   (data.address && data.address.phone)   || "",
            fax:     (data.address && data.address.fax)     || "",
          },
        });
        if (data.logo_url) setLogoPreview(data.logo_url);
      } catch {
        setToast({
          open: true,
          message: "Failed to load organization profile.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const setAddressField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    // Reset input so re-selecting the same file works after cancelling
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    const allowed = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];
    if (!allowed.includes(file.type)) {
      setLogoError("Only PNG, JPG, GIF, or WebP images are allowed.");
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      setLogoError("Logo must be smaller than 1 MB.");
      return;
    }

    setLogoError("");
    pendingFile.current = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropSrc(ev.target.result);
      setCropOpen(true);
    };
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
    setField("logo_url", "");
    pendingFile.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const e = {};
    if (!form.organization_name.trim())
      e.organization_name = "Organization name is required.";
    if (!form.country) e.country = "Country is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      let logo_url = form.logo_url;

      if (logoFile) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(logoFile);
        });
        const result = await uploadOrgLogo({
          logo_filename: pendingFile.current ? pendingFile.current.name : "cropped-logo.jpg",
          logo_base64: base64,
        });
        logo_url = result.logo_url;
      }

      const saved = await updateOrgProfile({ ...form, logo_url });
      setForm((prev) => ({ ...prev, logo_url: saved.logo_url || logo_url }));
      if (saved.logo_url) setLogoPreview(null); // server URL — don't need object URL
      setLogoFile(null);
      pendingFile.current = null;
      setToast({
        open: true,
        message: "Organization profile updated successfully.",
        severity: "success",
      });
    } catch (err) {
      const msg =
        err.response?.data?.error || "Failed to save organization profile.";
      setToast({ open: true, message: msg, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <MainLayout title="Organization Profile">
        <Box sx={{ bgcolor: C.pageBg, minHeight: "100vh" }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
          >
            <CircularProgress />
          </Box>
        </Box>
      </MainLayout>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <MainLayout title="Organization Profile">
      <Box sx={{ bgcolor: C.pageBg, minHeight: "100vh", pb: 6 }}>
        <Container maxWidth={false} sx={{ pt: 3, px: 2.5 }}>
          <Box
            sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}
          >
            {/* Left settings sub-nav */}
            <SettingsSubNav />

            {/* Main form card */}
            <Box sx={{ flex: 1 }}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                {/* ══ LOGO ═══════════════════════════════════════════════════ */}
                <Box sx={{ px: 3 }}>
                  <SectionHeader>Logo</SectionHeader>

                  <ZohoRow
                    label="Organization Logo"
                    hint="PNG, JPG, GIF or WebP. Max 1 MB."
                    noDivider
                    alignStart
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                      }}
                    >
                      {/* Preview box */}
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
                            alt="Organization logo"
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <BusinessIcon
                            sx={{ fontSize: 36, color: C.hint }}
                          />
                        )}
                      </Box>

                      {/* Upload controls */}
                      <Box>
                        <input
                          ref={fileInputRef}
                          id="org-logo-input"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                          style={{ display: "none" }}
                          onChange={handleLogoSelect}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CloudUploadIcon />}
                          onClick={() =>
                            fileInputRef.current &&
                            fileInputRef.current.click()
                          }
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
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              color: C.red,
                              mt: 0.75,
                              display: "block",
                            }}
                          >
                            {logoError}
                          </Typography>
                        )}
                        {logoFile && !logoError && (
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              color: C.hint,
                              mt: 0.75,
                              display: "block",
                            }}
                          >
                            {logoFile.name} —{" "}
                            {(logoFile.size / 1024).toFixed(1)} KB
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </ZohoRow>
                </Box>

                {/* ══ ORGANIZATION DETAILS ═══════════════════════════════════ */}
                <Box
                  sx={{
                    px: 3,
                    borderTop: `1px solid ${C.divider}`,
                  }}
                >
                  <SectionHeader>Organization Details</SectionHeader>

                  <ZohoRow label="Organization Name" required>
                    <TextField
                      fullWidth
                      size="small"
                      value={form.organization_name}
                      onChange={(e) =>
                        setField("organization_name", e.target.value)
                      }
                      error={!!errors.organization_name}
                      helperText={errors.organization_name}
                      placeholder="e.g. Acme Corp"
                      sx={fieldSx}
                    />
                  </ZohoRow>

                  <ZohoRow label="Industry">
                    <Box sx={{ maxWidth: 360 }}>
                      <Autocomplete
                        fullWidth
                        options={INDUSTRIES}
                        value={form.industry || null}
                        onChange={(_, next) => setField("industry", next || "")}
                        autoHighlight
                        openOnFocus
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        forcePopupIcon
                        isOptionEqualToValue={(option, val) => option === val}
                        ListboxProps={{
                          sx: {
                            "& .MuiAutocomplete-option": {
                              fontSize: "0.875rem",
                              minHeight: 36,
                              alignItems: "center",
                            },
                          },
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Select or search industry"
                            sx={fieldSx}
                          />
                        )}
                      />
                    </Box>
                  </ZohoRow>

                  <ZohoRow label="Country" required>
                    <Box sx={{ maxWidth: 360 }}>
                      <Autocomplete
                        fullWidth
                        options={COUNTRIES}
                        value={form.country || null}
                        onChange={(_, next) => setField("country", next || "")}
                        autoHighlight
                        openOnFocus
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        forcePopupIcon
                        isOptionEqualToValue={(option, val) => option === val}
                        ListboxProps={{
                          sx: {
                            "& .MuiAutocomplete-option": {
                              fontSize: "0.875rem",
                              minHeight: 36,
                              alignItems: "center",
                            },
                          },
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Select or search country"
                            error={!!errors.country}
                            helperText={errors.country}
                            sx={fieldSx}
                          />
                        )}
                      />
                    </Box>
                  </ZohoRow>

                  <ZohoRow
                    label="GSTIN"
                    hint="e.g. 22AAAAA0000A1Z5 (15 characters)"
                  >
                    <TextField
                      fullWidth
                      size="small"
                      value={form.gstin}
                      onChange={(e) =>
                        setField(
                          "gstin",
                          e.target.value.toUpperCase().replace(/\s+/g, "")
                        )
                      }
                      placeholder="22AAAAA0000A1Z5"
                      inputProps={{ maxLength: 15 }}
                      sx={fieldSx}
                    />
                  </ZohoRow>

                  <ZohoRow label="Website URL" noDivider>
                    <TextField
                      fullWidth
                      size="small"
                      value={form.website_url}
                      onChange={(e) =>
                        setField("website_url", e.target.value)
                      }
                      placeholder="https://example.com"
                      sx={fieldSx}
                    />
                  </ZohoRow>
                </Box>

                {/* ══ ADDRESS ════════════════════════════════════════════════ */}
                <Box
                  sx={{
                    px: 3,
                    borderTop: `1px solid ${C.divider}`,
                  }}
                >
                  <SectionHeader>Address</SectionHeader>

                  <ZohoRow label="Address Line 1">
                    <TextField
                      fullWidth
                      size="small"
                      value={form.address.line1}
                      onChange={(e) =>
                        setAddressField("line1", e.target.value)
                      }
                      placeholder="Street address"
                      sx={fieldSx}
                    />
                  </ZohoRow>

                  <ZohoRow label="Address Line 2">
                    <TextField
                      fullWidth
                      size="small"
                      value={form.address.line2}
                      onChange={(e) =>
                        setAddressField("line2", e.target.value)
                      }
                      placeholder="Apartment, suite, floor, etc."
                      sx={fieldSx}
                    />
                  </ZohoRow>

                  <ZohoRow label="City">
                    <TextField
                      size="small"
                      value={form.address.city}
                      onChange={(e) =>
                        setAddressField("city", e.target.value)
                      }
                      sx={{ ...fieldSx, maxWidth: 280 }}
                    />
                  </ZohoRow>

                  <ZohoRow label="State / Province">
                    <TextField
                      size="small"
                      value={form.address.state}
                      onChange={(e) =>
                        setAddressField("state", e.target.value)
                      }
                      sx={{ ...fieldSx, maxWidth: 280 }}
                    />
                  </ZohoRow>

                  <ZohoRow label="Postal / PIN Code" noDivider>
                    <TextField
                      size="small"
                      value={form.address.pincode}
                      onChange={(e) =>
                        setAddressField("pincode", e.target.value)
                      }
                      sx={{ ...fieldSx, maxWidth: 180 }}
                    />
                  </ZohoRow>
                </Box>

                {/* ══ CONTACT INFO ═══════════════════════════════════════════ */}
                <Box
                  sx={{
                    px: 3,
                    borderTop: `1px solid ${C.divider}`,
                  }}
                >
                  <SectionHeader>Contact Info</SectionHeader>

                  <ZohoRow
                    label="Phone"
                    hint="Include country code, e.g. +91-9876543210"
                  >
                    <TextField
                      size="small"
                      value={form.address.phone}
                      onChange={(e) =>
                        setAddressField("phone", e.target.value)
                      }
                      placeholder="+91-9876543210"
                      sx={{ ...fieldSx, maxWidth: 280 }}
                    />
                  </ZohoRow>

                  <ZohoRow label="Fax" noDivider>
                    <TextField
                      size="small"
                      value={form.address.fax}
                      onChange={(e) =>
                        setAddressField("fax", e.target.value)
                      }
                      sx={{ ...fieldSx, maxWidth: 280 }}
                    />
                  </ZohoRow>
                </Box>

                {/* ══ FOOTER ════════════════════════════════════════════════ */}
                <Box sx={footerSx}>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={
                      saving ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : null
                    }
                    sx={saveBtnSx}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 1:1 Crop Dialog */}
      <CropDialog
        open={cropOpen}
        src={cropSrc}
        onClose={handleCropCancel}
        onCrop={handleCropComplete}
      />

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
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
