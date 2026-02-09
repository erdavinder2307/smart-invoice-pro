// API configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5001',
  ENDPOINTS: {
    CUSTOMERS: '/api/customers',
    CUSTOMER_LOGIN: '/api/customer/login',
    CUSTOMER_INVOICES: '/api/customer/invoices',
    INVOICES: '/api/invoices',
    PRODUCTS: '/api/products',
    NEXT_INVOICE_NUMBER: '/api/invoices/next-number',
  }
};

// Helper function to create full API URL
export const createApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get API base URL
export const getApiBaseUrl = () => {
  return API_CONFIG.BASE_URL;
};

// API Functions
export const getCustomerInvoices = async (token) => {
  const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.CUSTOMER_INVOICES), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch customer invoices');
  }

  return await response.json();
};

export default API_CONFIG;
