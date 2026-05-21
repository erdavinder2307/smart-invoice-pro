import axios from "axios";
import { createApiUrl } from "../config/api";

export const mergeCustomerInto = async (sourceId, targetId) => {
  const response = await axios.post(createApiUrl(`/api/customers/${sourceId}/merge-into/${targetId}`));
  return response.data;
};

export const getCustomers = async (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ).toString();
  const path = query ? `/api/customers?${query}` : "/api/customers";
  const response = await axios.get(createApiUrl(path));
  return response.data;
};