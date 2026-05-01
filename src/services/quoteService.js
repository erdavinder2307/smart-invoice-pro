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
