import axios from "axios";
import { createApiUrl } from "../config/api";

const API_QUOTES = createApiUrl("/api/quotes");

const compactParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
);

export const getQuotesList = async (params = {}, signal) => {
  const response = await axios.get(API_QUOTES, {
    params: compactParams(params),
    signal,
  });
  return response.data;
};

export const bulkQuoteAction = async (payload) => {
  const response = await axios.post(createApiUrl("/api/quotes/bulk"), payload);
  return response.data;
};

export const deleteQuoteById = async (quoteId) => {
  const response = await axios.delete(createApiUrl(`/api/quotes/${quoteId}`));
  return response.data;
};

export const sendQuoteEmail = async (quoteId, payload) => {
  const response = await axios.post(createApiUrl(`/api/quotes/${quoteId}/send-email`), payload);
  return response.data;
};

export const getQuoteById = async (quoteId) => {
  const response = await axios.get(createApiUrl(`/api/quotes/${quoteId}`));
  return response.data;
};

export const downloadQuotePdf = async (quoteId, quoteNumber) => {
  const response = await axios.get(createApiUrl(`/api/quotes/${quoteId}/pdf`), {
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", `${quoteNumber || "quote"}.pdf`);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const exportQuotes = async (params = {}) => {
  const compacted = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const response = await axios.get(createApiUrl("/api/quotes/export"), {
    params: compacted,
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", "quotes-export.csv");
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
