import React from "react";
import { BRANDING } from "../../config/branding";

/**
 * Reusable app logo component with dark/light variants.
 *
 * Props:
 *   size      {number}  — image height in px (default 36)
 *   showText  {boolean} — render app name beside the logo (default false)
 *   textColor {string}  — CSS color for the app name text (default "inherit")
 *   variant   {string}  — "light" (for dark backgrounds) or "dark" (for light backgrounds) (default "dark")
 */
const Logo = ({ size = 36, showText = false, textColor = "inherit", variant = "dark" }) => {
  const logoSrc = variant === "light" ? BRANDING.logoLight : BRANDING.logoDark;
  
  // Apply filter to make dark logo visible on dark backgrounds (temporary until light logo images are saved)
  const imgStyle = {
    height: size,
    width: "auto",
    objectFit: "contain",
    flexShrink: 0,
    ...(variant === "light" && { filter: "brightness(0.95) invert(1) brightness(1.1)" }) // Invert dark logo to light for dark backgrounds
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <img
        src={logoSrc}
        alt={BRANDING.appName}
        style={imgStyle}
      />
      {showText && (
        <span
          style={{
            color: textColor,
            fontWeight: 700,
            fontSize: "1rem",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
          }}
        >
          {BRANDING.appName}
        </span>
      )}
    </div>
  );
};

export default Logo;
