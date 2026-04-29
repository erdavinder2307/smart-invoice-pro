import { useCallback, useEffect } from "react";

const isDev = process.env.NODE_ENV === "development";

const isEmptyValue = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const mergeAutoFillData = (target, source, fillEmptyOnly) => {
  if (Array.isArray(source)) {
    if (!fillEmptyOnly) return source;
    return isEmptyValue(target) ? source : target;
  }

  if (source && typeof source === "object") {
    const base = target && typeof target === "object" ? target : {};
    const out = { ...base };
    Object.keys(source).forEach((key) => {
      out[key] = mergeAutoFillData(base[key], source[key], fillEmptyOnly);
    });
    return out;
  }

  if (!fillEmptyOnly) return source;
  return isEmptyValue(target) ? source : target;
};

const useAutoFill = ({
  setForm,
  generator,
  context = {},
  scenario = "full",
  fillEmptyOnly = true,
  enableShortcut = true,
} = {}) => {
  const applyAutoFill = useCallback(() => {
    if (!isDev || typeof setForm !== "function" || typeof generator !== "function") return;
    const generated = generator({ scenario, context }) || {};
    setForm((prev) => mergeAutoFillData(prev, generated, fillEmptyOnly));
  }, [context, fillEmptyOnly, generator, scenario, setForm]);

  useEffect(() => {
    if (!isDev || !enableShortcut) return undefined;

    const onKeyDown = (event) => {
      const isCmdOrCtrl = event.ctrlKey || event.metaKey;
      if (!isCmdOrCtrl || !event.shiftKey || String(event.key).toLowerCase() !== "f") return;
      event.preventDefault();
      applyAutoFill();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [applyAutoFill, enableShortcut]);

  return {
    isAutoFillEnabled: isDev,
    applyAutoFill,
  };
};

export default useAutoFill;