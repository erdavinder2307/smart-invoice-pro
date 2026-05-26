import axios from "axios";
import { createApiUrl } from "../config/api";

export const getExpenseById = async (expenseId) => {
  const response = await axios.get(createApiUrl(`/api/expenses/${expenseId}`));
  return response.data;
};

export const exportExpenses = async (params = {}) => {
  const compacted = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const response = await axios.get(createApiUrl("/api/expenses/export"), {
    params: compacted,
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", "expenses-export.csv");
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
