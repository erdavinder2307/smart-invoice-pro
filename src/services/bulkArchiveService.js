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
  const response = await axios.post(createApiUrl(`/api/lifecycle/${path}/bulk-execute`), {
    ids,
    action: "delete",
  });
  return response.data;
};

export const parseBulkArchiveResult = (data) => {
  const deletedCount = Number(data?.deletedCount ?? 0);
  const archivedCount = Number(data?.archivedCount ?? 0);
  const restoredCount = Number(data?.restoredCount ?? 0);
  const successCount = Number(data?.processedCount ?? 0);
  const failedCount = Number(data?.failedCount ?? 0);
  const hasPartialFailure = failedCount > 0;

  let message = `Processed ${successCount} record(s): ${deletedCount} deleted, ${archivedCount} archived`;
  if (restoredCount > 0) {
    message += `, ${restoredCount} restored`;
  }
  if (failedCount > 0) {
    message += `. ${failedCount} failed.`;
  } else {
    message += ".";
  }

  return {
    successCount,
    failedCount,
    deletedCount,
    archivedCount,
    restoredCount,
    hasPartialFailure,
    dependencySummary: data?.dependencySummary ?? {},
    results: data?.results ?? [],
    message,
  };
};
