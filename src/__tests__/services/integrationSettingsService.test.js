import axios from 'axios';
import { getIntegrationSettings, saveIntegrationSettings, sendTestEmail, getWebhookLogs } from '../../services/integrationSettingsService';

jest.mock('axios');

afterEach(() => jest.clearAllMocks());

describe('integrationSettingsService', () => {
  it('fetches integration settings', async () => {
    const mockData = { stripe: { enabled: true }, razorpay: { enabled: false } };
    axios.get.mockResolvedValue({ data: mockData });

    const result = await getIntegrationSettings();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/settings/integrations'));
    expect(result).toEqual(mockData);
  });

  it('saves integration settings', async () => {
    const payload = { stripe: { enabled: false } };
    axios.put.mockResolvedValue({ data: { ...payload, saved: true } });

    const result = await saveIntegrationSettings(payload);
    expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/api/settings/integrations'), payload);
    expect(result.saved).toBe(true);
  });

  it('sends a test email', async () => {
    axios.post.mockResolvedValue({ data: { sent: true } });

    const result = await sendTestEmail('test@example.com');
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/settings/integrations/test-email'),
      { to: 'test@example.com' }
    );
    expect(result.sent).toBe(true);
  });

  it('fetches webhook delivery logs', async () => {
    const logs = [{ id: '1', event: 'invoice.created', success: true, status_code: 200 }];
    axios.get.mockResolvedValue({ data: logs });

    const result = await getWebhookLogs();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/settings/integrations/webhook-logs'));
    expect(result).toEqual(logs);
  });
});
