import axios from 'axios';
import { createApiUrl } from '../config/api';

export const createImportBatch = async (formData) => {
  const response = await axios.post(createApiUrl('/api/reconciliation/import-batches'), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const listImportBatches = async (bankAccountId) => {
  const response = await axios.get(createApiUrl('/api/reconciliation/import-batches'), {
    params: bankAccountId ? { bank_account_id: bankAccountId } : {},
  });
  return response.data;
};

export const getImportBatch = async (batchId) => {
  const response = await axios.get(createApiUrl(`/api/reconciliation/import-batches/${batchId}`));
  return response.data;
};

export const getImportJob = async (jobId) => {
  const response = await axios.get(createApiUrl(`/api/reconciliation/import-jobs/${jobId}`));
  return response.data;
};

export const getImportRows = async (batchId) => {
  const response = await axios.get(createApiUrl(`/api/reconciliation/import-batches/${batchId}/rows`));
  return response.data;
};

export const updateImportRow = async (batchId, rowId, payload) => {
  const response = await axios.patch(createApiUrl(`/api/reconciliation/import-batches/${batchId}/rows/${rowId}`), payload);
  return response.data;
};

export const approveImportBatch = async (batchId) => {
  const response = await axios.post(createApiUrl(`/api/reconciliation/import-batches/${batchId}/approve`), {});
  return response.data;
};

export const deleteImportBatch = async (batchId) => {
  const response = await axios.delete(createApiUrl(`/api/reconciliation/import-batches/${batchId}`));
  return response.data;
};