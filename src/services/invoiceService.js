import axios from 'axios';
import { createApiUrl } from '../config/api';

const API_INVOICES = createApiUrl('/api/invoices');

const compactParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

export const getInvoicesList = async (params = {}, signal) => {
  const response = await axios.get(API_INVOICES, {
    params: compactParams(params),
    signal,
  });
  return response.data;
};

export const bulkInvoiceAction = async (payload) => {
  const response = await axios.post(createApiUrl('/api/invoices/bulk'), payload);
  return response.data;
};

// Legacy compat — kept so AddEditInvoice still works
export const getInvoices = async (params = {}) => {
  const response = await axios.get(API_INVOICES, {
    params: compactParams(params),
  });
  return response.data;
};

export const createInvoice = async (invoice) => {
  const response = await axios.post(API_INVOICES, invoice);
  return response.data;
};

export const updateInvoice = async (id, invoice) => {
  const response = await axios.put(`${API_INVOICES}/${id}`, invoice);
  return response.data;
};

export const deleteInvoice = async (id) => {
  const response = await axios.delete(`${API_INVOICES}/${id}`);
  return response.data;
};

export const sendInvoiceEmail = async (id, payload) => {
  const response = await axios.post(`${API_INVOICES}/${id}/send-email`, payload);
  return response.data;
};

export const recordPayment = async (id, payload) => {
  const response = await axios.post(`${API_INVOICES}/${id}/record-payment`, payload);
  return response.data;
};

export const voidInvoice = async (id, reason) => {
  const response = await axios.post(`${API_INVOICES}/${id}/void`, { reason });
  return response.data;
};

export const exportInvoices = async (params = {}) => {
  const response = await axios.get(createApiUrl('/api/invoices/export'), {
    params: compactParams(params),
    responseType: 'blob',
  });
  const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'invoices-export.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
