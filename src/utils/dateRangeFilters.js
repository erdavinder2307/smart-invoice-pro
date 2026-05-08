const pad = (value) => String(value).padStart(2, "0");

export const formatDateOnly = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const normalizeDateOnly = (value) => {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return formatDateOnly(value);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return formatDateOnly(parsed);
  }

  const rawValue = String(value).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(rawValue) ? rawValue : "";
};

export const getDateRange = (range, now = new Date()) => {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (range === "this_week") {
    const start = new Date(now);
    const mondayOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - mondayOffset);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (range === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (range === "this_quarter") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(now.getFullYear(), quarterStartMonth, 1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (range === "this_year") {
    const start = new Date(now.getFullYear(), 0, 1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  return null;
};

export const readDateFilterQuery = (search, fieldName) => {
  const params = new URLSearchParams(search);
  return {
    range: params.get(`${fieldName}_range`) || "",
    from: params.get(`${fieldName}_from`) || "",
    to: params.get(`${fieldName}_to`) || "",
  };
};

const buildApiDateTime = (dateOnly, isEndOfDay = false) => {
  const normalized = normalizeDateOnly(dateOnly);
  if (!normalized) {
    return "";
  }

  return isEndOfDay ? `${normalized}T23:59:59.999999` : `${normalized}T00:00:00`;
};

export const buildApiDateFilterParams = ({ range, from, to }, fieldName) => {
  const explicitFrom = normalizeDateOnly(from);
  const explicitTo = normalizeDateOnly(to);
  if (explicitFrom && explicitTo) {
    return {
      [`${fieldName}_from`]: buildApiDateTime(explicitFrom),
      [`${fieldName}_to`]: buildApiDateTime(explicitTo, true),
    };
  }

  if (!range) {
    return {};
  }

  const resolved = getDateRange(range);
  if (!resolved) {
    return {};
  }

  return {
    [`${fieldName}_from`]: buildApiDateTime(formatDateOnly(resolved.start)),
    [`${fieldName}_to`]: buildApiDateTime(formatDateOnly(resolved.end), true),
  };
};

export const buildNavigationDateFilterParams = (fieldName, rangeParams = {}) => {
  const { range, start_date: startDate, end_date: endDate } = rangeParams;
  if (range === "custom") {
    const from = normalizeDateOnly(startDate);
    const to = normalizeDateOnly(endDate);
    return {
      [`${fieldName}_from`]: from,
      [`${fieldName}_to`]: to,
    };
  }

  if (!range) {
    return {};
  }

  return {
    [`${fieldName}_range`]: range,
  };
};

export const formatRangeLabel = (range, t) => {
  if (range === "this_week") return t("customerList.filters.thisWeek");
  if (range === "this_month") return t("customerList.filters.thisMonth");
  if (range === "this_quarter") return t("customerList.filters.thisQuarter");
  if (range === "this_year") return t("customerList.filters.thisYear");
  return range;
};

export const formatDateFilterLabel = ({ range, from, to }, t) => {
  if (range) {
    return `${t("customerList.filters.createdPrefix")}: ${formatRangeLabel(range, t)}`;
  }

  const normalizedFrom = normalizeDateOnly(from);
  const normalizedTo = normalizeDateOnly(to);
  if (normalizedFrom && normalizedTo) {
    return t("customerList.filters.createdCustomRange", { from: normalizedFrom, to: normalizedTo });
  }

  return "";
};