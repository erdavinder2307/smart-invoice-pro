import axios from 'axios';
import { createApiUrl } from '../config/api';

const API_URL = createApiUrl('/api/invoices');

export const getInvoices = async (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ).toString();
  const path = query ? `/api/invoices?${query}` : "/api/invoices";
  const response = await axios.get(createApiUrl(path));
  return response.data;
};

export const createInvoice = async (invoice) => {
  const response = await axios.post(API_URL, invoice);
  return response.data;
};

export const updateInvoice = async (id, invoice) => {
  const response = await axios.put(`${API_URL}/${id}`, invoice);
  return response.data;
};

export const deleteInvoice = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const sendInvoiceEmail = async (id, payload) => {
  const response = await axios.post(`${API_URL}/${id}/send-email`, payload);
  return response.data;
};

export const recordPayment = async (id, payload) => {
  const response = await axios.post(`${API_URL}/${id}/record-payment`, payload);
  return response.data;
};
