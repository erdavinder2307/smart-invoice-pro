import axios from "axios";
import { createApiUrl } from "../config/api";

const isDev = process.env.NODE_ENV === "development";

export const updateProductStock = async ({ productId, quantity, operation = "increment", source = "Manual adjustment" }) => {
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
