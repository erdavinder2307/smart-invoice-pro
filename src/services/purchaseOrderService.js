import axios from "axios";
import { createApiUrl } from "../config/api";

const API_PURCHASE_ORDERS = createApiUrl("/api/purchase-orders");

const compactParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
);

export const getPurchaseOrdersList = async (params = {}, signal) => {
  const response = await axios.get(API_PURCHASE_ORDERS, {
    params: compactParams(params),
    signal,
  });
  return response.data;
};

export const deletePurchaseOrderById = async (poId) => {
  const response = await axios.delete(createApiUrl(`/api/purchase-orders/${poId}`));
  return response.data;
};

export const bulkPurchaseOrderAction = async (payload) => {
  const response = await axios.post(createApiUrl("/api/purchase-orders/bulk"), payload);
  return response.data;
};

export const sendPurchaseOrderEmail = async (poId, payload) => {
  const response = await axios.post(createApiUrl(`/api/purchase-orders/${poId}/send-email`), payload);
  return response.data;
};

export const convertPurchaseOrderToBill = async (poId, payload = {}) => {
  const response = await axios.post(createApiUrl(`/api/purchase-orders/${poId}/convert-bill`), payload);
  return response.data;
};
