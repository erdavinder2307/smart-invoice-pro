import axios from 'axios';
import { getIntegrationSettings, saveIntegrationSettings } from '../../services/integrationSettingsService';

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
});
