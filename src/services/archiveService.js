import axios from "axios";
import { createApiUrl } from "../config/api";

const ENTITY_PATHS = {
  product: "products",
  customer: "customers",
  vendor: "vendors",
  quote: "quotes",
  invoice: "invoices",
  sales_order: "sales-orders",
  salesorder: "sales-orders",
  bill: "bills",
  purchase_order: "purchase-orders",
  purchaseorder: "purchase-orders",
  expense: "expenses",
  recurring_profile: "recurring-profiles",
  recurringprofile: "recurring-profiles",
};

const resolveEntityPath = (entityType) => {
  const path = ENTITY_PATHS[String(entityType || "").toLowerCase()];
  if (!path) {
    throw new Error(`Unsupported archive entity type: ${entityType}`);
  }
  return path;
};

export const checkDependencies = async (entityType, entityId) => {
  const path = resolveEntityPath(entityType);
  const response = await axios.get(createApiUrl(`/api/lifecycle/${path}/${entityId}/analysis`));
  return response.data;
};

export const archiveEntity = async (entityType, entityId) => {
  const path = resolveEntityPath(entityType);
  const response = await axios.post(createApiUrl(`/api/lifecycle/${path}/${entityId}/execute`), {
    action: "archive",
  });
  return response.data;
};

export const restoreEntity = async (entityType, entityId) => {
  const path = resolveEntityPath(entityType);
  const response = await axios.post(createApiUrl(`/api/lifecycle/${path}/${entityId}/execute`), {
    action: "restore",
  });
  return response.data;
};
