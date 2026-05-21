/**
 * stockHelpers.js — Single source of truth for inventory stock status logic.
 *
 * Used by: ProductList, ItemCard, ProductStockSummary, Dashboard widgets.
 *
 * Design principles (Zoho Inventory / NetSuite-aligned):
 * - Status is derived purely from qty vs reorder_level — never from a stored string.
 * - Replenishment actions are contextual: only shown when stock is at/below reorder level.
 * - Archived items are always excluded from replenishment workflows.
 */

/**
 * Compute the effective available quantity for a product.
 * Prefers the live-computed `stock` field from the API (already aggregated from
 * stock transactions) and falls back to opening_stock minus sold for legacy records.
 */
export const getAvailableQuantity = (product) => {
  if (product == null) return 0;
  const stock = product.stock;
  if (stock !== undefined && stock !== null && stock !== "") {
    const n = Number(stock);
    return Number.isFinite(n) ? n : 0;
  }
  const opening = Number(product.opening_stock) || 0;
  const sold = Number(product.sold) || 0;
  return opening - sold;
};

/**
 * Determine whether a product record is archived / inactive.
 */
export const isArchivedProduct = (product) =>
  product == null ||
  product.is_deleted === true ||
  String(product.status || "").toUpperCase() === "ARCHIVED" ||
  String(product.lifecycle_status || "").toUpperCase() === "ARCHIVED";

/**
 * Compute stock status metadata for display.
 *
 * Buckets:
 *   "Critical"  qty <= 0              → Out of Stock / negative
 *   "Low Stock" 0 < qty <= reorderLevel → approaching threshold
 *   "In Stock"  qty > reorderLevel     → healthy
 *
 * reorder_level falls back to 10 when the product has no configured threshold,
 * matching the existing behaviour so no visible regression occurs.
 *
 * @returns {{ bucket: string, label: string, chipColor: string, textColor: string, highlight: boolean }}
 */
export const getStockMeta = (product) => {
  if (isArchivedProduct(product)) {
    return {
      bucket: "Archived",
      label: "Archived",
      chipColor: "default",
      textColor: "#6b7280",
      highlight: false,
    };
  }

  const availableQty = getAvailableQuantity(product);
  const reorderLevel = Number.isFinite(Number(product.reorder_level))
    ? Number(product.reorder_level)
    : 10;

  if (availableQty <= 0) {
    return {
      bucket: "Critical",
      label: "Out of Stock",
      chipColor: "error",
      textColor: "#dc2626",
      highlight: true,
    };
  }

  if (availableQty <= reorderLevel) {
    return {
      bucket: "Low Stock",
      label: "Low Stock",
      chipColor: "warning",
      textColor: "#b45309",
      highlight: false,
    };
  }

  return {
    bucket: "In Stock",
    label: "In Stock",
    chipColor: "success",
    textColor: "#166534",
    highlight: false,
  };
};

/**
 * Determine whether a product currently needs replenishment.
 *
 * Enterprise rule (Zoho / NetSuite):
 *   A product needs replenishment when its stock is at or below its reorder
 *   threshold — i.e. it is Critical or Low Stock. Healthy in-stock items
 *   MUST NOT show replenishment actions.
 *
 * Also guards archived items — they are never eligible for replenishment.
 */
export const needsReplenishment = (product) => {
  if (isArchivedProduct(product)) return false;
  const bucket = getStockMeta(product).bucket;
  return bucket === "Critical" || bucket === "Low Stock";
};

/**
 * Returns true when the product has a preferred vendor configured and
 * currently needs replenishment. Both conditions must be met before the
 * "Restock" action is surfaced to the user.
 */
export const canRestock = (product) =>
  needsReplenishment(product) && Boolean(product?.preferred_vendor_id);

/**
 * Status sort rank for ordering items by urgency (ascending = most urgent first).
 *   0 — Critical
 *   1 — Low Stock
 *   2 — In Stock
 *   3 — Archived
 */
export const getStatusSortRank = (product) => {
  if (isArchivedProduct(product)) return 3;
  const bucket = getStockMeta(product).bucket;
  if (bucket === "Critical") return 0;
  if (bucket === "Low Stock") return 1;
  return 2;
};
