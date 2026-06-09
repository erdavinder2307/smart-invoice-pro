/**
 * Shared line-item rate validation for invoices, quotes, bills, and POs.
 */
export const validateLineItemRate = (rate, { allowZero = false } = {}) => {
  const numericRate = Number(rate);
  if (!Number.isFinite(numericRate)) {
    return "Rate must be a valid number";
  }
  if (numericRate < 0) {
    return "Rate cannot be negative";
  }
  if (!allowZero && numericRate === 0) {
    return "Rate must be greater than zero";
  }
  return "";
};

export const hasInvalidLineItemRates = (items = [], options = {}) =>
  (items || []).some((item) => {
    const qty = Number(item?.quantity ?? 0);
    const hasName = String(item?.name || item?.description || "").trim() !== "";
    if (!hasName && qty <= 0) return false;
    return Boolean(validateLineItemRate(item?.rate, options));
  });
