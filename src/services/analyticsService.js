import { logEvent, analytics } from '../config/firebase';

/**
 * Analytics Service
 * Tracks user interactions, business events, and errors
 * Designed for B2B SaaS invoicing application
 */

const analyticsService = {
  /**
   * Track page view (called on route changes)
   * @param {string} pageName - e.g., '/dashboard', '/invoices', '/login'
   * @param {string} pageTitle - Human-readable page title
   */
  trackPageView: (pageName, pageTitle) => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'page_view', {
        page_path: pageName,
        page_title: pageTitle,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (page_view):', error);
    }
  },

  /**
   * Track user signup
   */
  trackSignup: (username) => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'sign_up', {
        method: 'email',
        username,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (sign_up):', error);
    }
  },

  /**
   * Track user login
   */
  trackLogin: (username, method = 'email') => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'login', {
        method,
        username,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (login):', error);
    }
  },

  /**
   * Track user logout
   */
  trackLogout: (username) => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'logout', {
        username,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (logout):', error);
    }
  },

  /**
   * Track invoice creation
   */
  trackInvoiceCreated: (invoiceId, amount, currency = 'USD') => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'invoice_created', {
        invoice_id: invoiceId,
        amount: parseFloat(amount),
        currency,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (invoice_created):', error);
    }
  },

  /**
   * Track invoice update
   */
  trackInvoiceUpdated: (invoiceId, status) => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'invoice_updated', {
        invoice_id: invoiceId,
        status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (invoice_updated):', error);
    }
  },

  /**
   * Track invoice sent to customer
   */
  trackInvoiceSent: (invoiceId, recipientEmail) => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'invoice_sent', {
        invoice_id: invoiceId,
        recipient_email: recipientEmail,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (invoice_sent):', error);
    }
  },

  /**
   * Track payment recorded
   */
  trackPaymentRecorded: (invoiceId, amount, paymentMethod = 'bank_transfer') => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'payment_recorded', {
        invoice_id: invoiceId,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (payment_recorded):', error);
    }
  },

  /**
   * Track customer created
   */
  trackCustomerCreated: (customerId) => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'customer_created', {
        customer_id: customerId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (customer_created):', error);
    }
  },

  /**
   * Track product created
   */
  trackProductCreated: (productId, price) => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'product_created', {
        product_id: productId,
        price: parseFloat(price),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (product_created):', error);
    }
  },

  /**
   * Track quote generated
   */
  trackQuoteGenerated: (quoteId, amount) => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'quote_generated', {
        quote_id: quoteId,
        amount: parseFloat(amount),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (quote_generated):', error);
    }
  },

  /**
   * Track report generated
   */
  trackReportGenerated: (reportType) => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'report_generated', {
        report_type: reportType, // e.g., 'profit_loss', 'balance_sheet', 'aging'
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (report_generated):', error);
    }
  },

  /**
   * Track export action
   */
  trackExport: (fileType, resourceType) => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'export', {
        file_type: fileType, // e.g., 'pdf', 'xlsx', 'csv'
        resource_type: resourceType, // e.g., 'invoice', 'payment', 'report'
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (export):', error);
    }
  },

  /**
   * Track feature usage
   */
  trackFeatureUsed: (featureName, metadata = {}) => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'feature_used', {
        feature_name: featureName,
        ...metadata,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (feature_used):', error);
    }
  },

  /**
   * Track error/exception
   */
  trackError: (errorName, errorMessage, severity = 'error') => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'exception', {
        description: `${errorName}: ${errorMessage}`,
        severity,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (exception):', error);
    }
  },

  /**
   * Track API error
   */
  trackApiError: (endpoint, statusCode, errorMessage) => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'api_error', {
        endpoint,
        status_code: statusCode,
        error_message: errorMessage,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (api_error):', error);
    }
  },

  /**
   * Track settings changed
   */
  trackSettingsChanged: (settingName, newValue) => {
    if (!analytics) return;
    try {
      logEvent(analytics, 'settings_changed', {
        setting_name: settingName,
        // Don't log sensitive values, just the fact it changed
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error (settings_changed):', error);
    }
  },

  /**
   * Track custom event
   */
  trackEvent: (eventName, eventData = {}) => {
    if (!analytics) return;
    try {
      logEvent(analytics, eventName, {
        ...eventData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Analytics error (${eventName}):`, error);
    }
  },
};

export default analyticsService;
