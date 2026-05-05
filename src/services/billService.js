import axios from "axios";
import { createApiUrl } from "../config/api";

const API_BILLS = createApiUrl("/api/bills");

const compactParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
);

export const getBillsList = async (params = {}, signal) => {
  const response = await axios.get(API_BILLS, {
    params: compactParams(params),
    signal,
  });
  return response.data;
};

export const getBillById = async (billId, signal) => {
  const response = await axios.get(createApiUrl(`/api/bills/${billId}`), { signal });
  return response.data;
};

export const deleteBillById = async (billId) => {
  const response = await axios.delete(createApiUrl(`/api/bills/${billId}`));
  return response.data;
};

export const recordBillPayment = async (billId, payload) => {
  const response = await axios.post(createApiUrl(`/api/bills/${billId}/record-payment`), payload);
  return response.data;
};

export const markBillAsPaid = async (bill) => {
  const amount = Number(bill?.balance_due || 0);
  if (!bill?.id || amount <= 0) {
    return { skipped: true };
  }

  return recordBillPayment(bill.id, {
    amount,
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: "Manual",
    reference: "Mark as paid from bills list",
  });
};
