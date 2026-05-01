import { useEffect, useMemo, useState } from "react";

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalize = (value) => String(value || "").trim();

export const useListController = ({
  location,
  navigate,
  defaults = {},
}) => {
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [page, setPage] = useState(() => Math.max(0, toInt(params.get("page"), defaults.page || 1) - 1));
  const [rowsPerPage, setRowsPerPage] = useState(() => toInt(params.get("page_size"), defaults.pageSize || 10));
  const [search, setSearch] = useState(() => normalize(params.get("q") || defaults.search || ""));
  const [status, setStatus] = useState(() => params.get("status") || defaults.status || "All");
  const [dateRange, setDateRange] = useState(() => params.get("date_range") || defaults.dateRange || "this_month");
  const [dateFrom, setDateFrom] = useState(() => normalize(params.get("date_from") || defaults.dateFrom || ""));
  const [dateTo, setDateTo] = useState(() => normalize(params.get("date_to") || defaults.dateTo || ""));
  const [minAmount, setMinAmount] = useState(() => normalize(params.get("min_amount") || defaults.minAmount || ""));
  const [maxAmount, setMaxAmount] = useState(() => normalize(params.get("max_amount") || defaults.maxAmount || ""));

  useEffect(() => {
    const next = new URLSearchParams(location.search);

    next.set("page", String(page + 1));
    next.set("page_size", String(rowsPerPage));

    if (search) next.set("q", search);
    else next.delete("q");

    if (status && status !== "All") next.set("status", status);
    else next.delete("status");

    if (dateRange) next.set("date_range", dateRange);
    else next.delete("date_range");

    if (dateRange === "custom") {
      if (dateFrom) next.set("date_from", dateFrom);
      else next.delete("date_from");
      if (dateTo) next.set("date_to", dateTo);
      else next.delete("date_to");
    } else {
      next.delete("date_from");
      next.delete("date_to");
    }

    if (minAmount) next.set("min_amount", minAmount);
    else next.delete("min_amount");
    if (maxAmount) next.set("max_amount", maxAmount);
    else next.delete("max_amount");

    const currentString = location.search.replace(/^\?/, "");
    const nextString = next.toString();
    if (currentString !== nextString) {
      navigate(`${location.pathname}?${nextString}`, { replace: true });
    }
  }, [
    dateFrom,
    dateRange,
    dateTo,
    location.pathname,
    location.search,
    maxAmount,
    minAmount,
    navigate,
    page,
    rowsPerPage,
    search,
    status,
  ]);

  const setSearchAndReset = (value) => {
    setSearch(value);
    setPage(0);
  };

  const setStatusAndReset = (value) => {
    setStatus(value);
    setPage(0);
  };

  const setDateRangeAndReset = (value) => {
    setDateRange(value);
    if (value !== "custom") {
      setDateFrom("");
      setDateTo("");
    }
    setPage(0);
  };

  const setAmountRangeAndReset = (min, max) => {
    setMinAmount(min);
    setMaxAmount(max);
    setPage(0);
  };

  const setRowsPerPageAndReset = (value) => {
    setRowsPerPage(value);
    setPage(0);
  };

  return {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage: setRowsPerPageAndReset,
    search,
    setSearch: setSearchAndReset,
    status,
    setStatus: setStatusAndReset,
    dateRange,
    setDateRange: setDateRangeAndReset,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    minAmount,
    maxAmount,
    setAmountRange: setAmountRangeAndReset,
  };
};

export default useListController;
