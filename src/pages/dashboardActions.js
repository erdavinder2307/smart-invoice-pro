export const dashboardActions = {
  goToCustomers: (navigate) => () => navigate("/customers"),
  goToProducts: (navigate) => () => navigate("/products"),
  goToInvoices: (navigate) => () => navigate("/invoices"),
  goToSalesSummary: (navigate) => () => navigate("/reports/sales-summary"),
  goToOverdue: (navigate) => () => navigate("/invoices?filter=overdue"),
  goToArAging: (navigate) => () => navigate("/reports/ar-aging"),
  goToApAging: (navigate) => () => navigate("/reports/ap-aging"),
  goToRecurringProfiles: (navigate) => () => navigate("/recurring-profiles"),
  goToAddInvoice: (navigate) => () => navigate("/invoices/add"),
  goToAddCustomer: (navigate) => () => navigate("/customers/add"),
  goToAddProduct: (navigate) => () => navigate("/products/add"),
};
