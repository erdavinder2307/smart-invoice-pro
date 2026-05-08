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
    throw new Error(`Unsupported bulk archive entity type: ${entityType}`);
  }
  return path;
};

export const bulkArchiveEntities = async (entityType, ids) => {
  const path = resolveEntityPath(entityType);
  const response = await axios.post(createApiUrl(`/api/${path}/bulk-archive`), {
    ids,
    action: "archive",
  });
  return response.data;
};

export const parseBulkArchiveResult = (data) => {
  const successCount = data?.successCount ?? data?.archived?.length ?? 0;
  const failedCount = data?.failedCount ?? data?.failed?.length ?? 0;
  const hasPartialFailure = failedCount > 0;
  const message = hasPartialFailure
    ? `Archived ${successCount} record(s). ${failedCount} could not be archived (dependencies or locked status).`
    : `Successfully archived ${successCount} record(s).`;
  return {
    successCount,
    failedCount,
    archived: data?.archived ?? [],
    failed: data?.failed ?? [],
    hasPartialFailure,
    message,
  };
};
