import axios from "axios";
import { createApiUrl } from "../config/api";

export const getCustomers = async (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ).toString();
  const path = query ? `/api/customers?${query}` : "/api/customers";
  const response = await axios.get(createApiUrl(path));
  return response.data;
};