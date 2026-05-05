const BLOCKED_HOSTS = new Set(["www.solidevbooks.com"]);
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export const isAutoFillEnabledForHost = (hostname = "") => {
  const host = String(hostname || "").trim().toLowerCase();

  if (!host) {
    return process.env.NODE_ENV !== "production";
  }

  if (BLOCKED_HOSTS.has(host)) return false;
  if (host.endsWith(".azurestaticapps.net")) return true;
  if (LOCAL_HOSTS.has(host)) return true;

  return process.env.NODE_ENV !== "production";
};

export const isAutoFillEnabled = () => {
  if (typeof window === "undefined" || !window.location) {
    return process.env.NODE_ENV !== "production";
  }
  return isAutoFillEnabledForHost(window.location.hostname);
};
