import { buildNavigationDateFilterParams } from "../utils/dateRangeFilters";

const withQuery = (path, queryParams = {}) => {
  const params = new URLSearchParams(
    Object.entries(queryParams).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
  const query = params.toString();
  return query ? `${path}?${query}` : path;
};

// Convert dashboard range params to simple start_date/end_date or range for non-invoice pages
const buildSimpleDateParams = (rangeParams = {}) => {
  if (!rangeParams?.range) return {};
  if (rangeParams.range === "custom") {
    return {
      start_date: rangeParams.start_date || undefined,
      end_date: rangeParams.end_date || undefined,
    };
  }
  return { range: rangeParams.range };
};

export const dashboardActions = {
  goToCustomersAdded: (navigate, rangeParams) => () => navigate(withQuery("/customers", buildNavigationDateFilterParams("created", rangeParams))),
  goToTotalCustomers: (navigate) => () => navigate("/customers"),
  goToProducts: (navigate) => () => navigate("/products"),
  goToInvoicesCreated: (navigate, rangeParams) => () => navigate(withQuery("/invoices", buildNavigationDateFilterParams("created", rangeParams))),
  goToRevenue: (navigate, rangeParams) => () => navigate(withQuery("/reports/sales-summary", buildSimpleDateParams(rangeParams))),
  goToPaymentsReceived: (navigate, rangeParams) => () => navigate(withQuery("/reports/payments-received", buildSimpleDateParams(rangeParams))),
  goToPayablesExpenses: (navigate, rangeParams) => () => navigate(withQuery("/expenses", buildSimpleDateParams(rangeParams))),
  goToOverdue: (navigate) => () => navigate(withQuery("/invoices", { status: "Overdue" })),
  goToDueToday: (navigate) => () => navigate(withQuery("/invoices", { due_date: new Date().toISOString().slice(0, 10) })),
  goToLowStockItems: (navigate) => () => navigate(withQuery("/products", { filter: "Low Stock" })),
  goToCriticalStock: (navigate) => () => navigate(withQuery("/products", { filter: "Critical" })),
  goToInvoiceEdit: (navigate, invoiceId) => () => navigate(`/invoices/edit/${invoiceId}`),
  goToInvoicesWithContext: (navigate, rangeParams, extra = {}) => () =>
    navigate(withQuery("/invoices", { ...buildNavigationDateFilterParams("created", rangeParams), ...extra })),
  goToRecurringProfiles: (navigate) => () => navigate("/recurring-profiles"),
  goToAddInvoice: (navigate) => () => navigate("/invoices/add"),
  goToAddCustomer: (navigate) => () => navigate("/customers/add"),
  goToAddProduct: (navigate) => () => navigate("/products/add"),
};
