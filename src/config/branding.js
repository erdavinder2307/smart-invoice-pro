import logo from "../assets/logo.png";

// TODO: Replace with actual dark/light variants once images are saved to src/assets/
// import logoDark from "../assets/logo-dark.png";
// import logoLight from "../assets/logo-light.png";

export const BRANDING = {
  appName: "Solidev Books",
  tagline: "Pro Edition",
  logoDark: logo,  // Temporary fallback - use actual logo-dark.png once saved
  logoLight: logo, // Temporary fallback - use actual logo-light.png once saved
};

// Helper to get the right logo for a background
export const getLogoForBackground = (backgroundType = "light") => {
  return backgroundType === "light" ? BRANDING.logoDark : BRANDING.logoLight;
};
