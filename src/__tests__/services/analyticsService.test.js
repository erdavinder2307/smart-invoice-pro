const loadAnalyticsService = ({ analyticsValue = { app: 'mock-analytics' }, logEventImpl } = {}) => {
  const mockLogEvent = jest.fn(logEventImpl);
  let service;

  jest.isolateModules(() => {
    jest.doMock('../../config/firebase', () => ({
      analytics: analyticsValue,
      logEvent: mockLogEvent,
    }));

    service = require('../../services/analyticsService').default;
  });

  return { service, mockLogEvent };
};

describe('analyticsService', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('tracks all supported events with expected payload shapes', () => {
    const { service, mockLogEvent } = loadAnalyticsService();

    service.trackPageView('/dashboard', 'Dashboard');
    service.trackSignup('alice');
    service.trackLogin('alice', 'sso');
    service.trackLogout('alice');
    service.trackInvoiceCreated('inv-1', '123.45', 'INR');
    service.trackInvoiceUpdated('inv-1', 'sent');
    service.trackInvoiceSent('inv-1', 'customer@example.com');
    service.trackPaymentRecorded('inv-1', '50.25', 'upi');
    service.trackCustomerCreated('cust-1');
    service.trackProductCreated('prod-1', '19.99');
    service.trackQuoteGenerated('q-1', '1000.00');
    service.trackReportGenerated('profit_loss');
    service.trackExport('pdf', 'invoice');
    service.trackFeatureUsed('bulk_edit', { module: 'products' });
    service.trackError('ValidationError', 'price too high', 'warning');
    service.trackApiError('/api/products', 400, 'bad request');
    service.trackSettingsChanged('theme', 'dark');
    service.trackEvent('custom_event', { source: 'test' });

    expect(mockLogEvent).toHaveBeenCalledTimes(18);

    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.any(Object),
      'page_view',
      expect.objectContaining({
        page_path: '/dashboard',
        page_title: 'Dashboard',
        timestamp: expect.any(String),
      })
    );

    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.any(Object),
      'invoice_created',
      expect.objectContaining({
        invoice_id: 'inv-1',
        amount: 123.45,
        currency: 'INR',
      })
    );

    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.any(Object),
      'payment_recorded',
      expect.objectContaining({
        invoice_id: 'inv-1',
        amount: 50.25,
        payment_method: 'upi',
      })
    );

    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.any(Object),
      'feature_used',
      expect.objectContaining({
        feature_name: 'bulk_edit',
        module: 'products',
      })
    );

    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.any(Object),
      'exception',
      expect.objectContaining({
        description: 'ValidationError: price too high',
        severity: 'warning',
      })
    );

    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.any(Object),
      'settings_changed',
      expect.objectContaining({
        setting_name: 'theme',
      })
    );

    const settingsCall = mockLogEvent.mock.calls.find(([, eventName]) => eventName === 'settings_changed');
    expect(settingsCall[2].newValue).toBeUndefined();

    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.any(Object),
      'custom_event',
      expect.objectContaining({
        source: 'test',
      })
    );
  });

  it('does nothing when analytics is unavailable', () => {
    const { service, mockLogEvent } = loadAnalyticsService({ analyticsValue: null });

    service.trackLogin('alice');
    service.trackEvent('custom_event', { source: 'test' });

    expect(mockLogEvent).not.toHaveBeenCalled();
  });

  it('swallows logging failures and writes to console.error', () => {
    const error = new Error('firebase down');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { service } = loadAnalyticsService({ logEventImpl: () => { throw error; } });

    service.trackApiError('/api/items', 500, 'boom');

    expect(consoleSpy).toHaveBeenCalledWith('Analytics error (api_error):', error);

    consoleSpy.mockRestore();
  });
});
