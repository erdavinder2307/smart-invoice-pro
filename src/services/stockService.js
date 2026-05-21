import axios from "axios";
import { createApiUrl } from "../config/api";

const isDev = process.env.NODE_ENV === "development";

export const updateProductStock = async ({ productId, quantity, operation = "increment", source = "Manual adjustment", reason, referenceNumber, adjustmentDate }) => {
  const normalizedQuantity = Number(quantity);
  if (!productId) {
    throw new Error("productId is required");
  }
  if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
    throw new Error("quantity must be greater than 0");
  }

  const endpoint = operation === "decrement" ? "/api/stock/reduce" : "/api/stock/add";
  const payload = {
    product_id: productId,
    quantity: normalizedQuantity,
    source,
    operation,
    ...(reason ? { reason } : {}),
    ...(referenceNumber ? { reference_number: referenceNumber } : {}),
    ...(adjustmentDate ? { adjustment_date: adjustmentDate } : {}),
  };

  if (isDev) {
    // Temporary debugging log for stock update tracing
    console.debug("[stockService] request", { endpoint, payload });
  }

  const response = await axios.post(createApiUrl(endpoint), payload);

  if (isDev) {
    // Temporary debugging log for stock update tracing
    console.debug("[stockService] response", response.data);
  }

  return response.data;
};

export const getStockLedger = async (productId) => {
  const response = await axios.get(createApiUrl(`/api/stock/ledger/${productId}`));
  return response.data;
};

export const adjustStock = async (data) => {
  const response = await axios.post(createApiUrl('/api/stock/adjust'), data);
  return response.data;
};
