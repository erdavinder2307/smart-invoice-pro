import axios from 'axios';
import { getAutomationSettings, saveAutomationSettings } from '../../services/automationService';

jest.mock('axios');

afterEach(() => jest.clearAllMocks());

describe('automationService', () => {
  it('fetches automation settings', async () => {
    const mockData = { auto_send_invoices: true, reminder_days: 7 };
    axios.get.mockResolvedValue({ data: mockData });

    const result = await getAutomationSettings();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/settings/automation'));
    expect(result).toEqual(mockData);
  });

  it('saves automation settings', async () => {
    const payload = { auto_send_invoices: false, reminder_days: 14 };
    axios.put.mockResolvedValue({ data: { ...payload, updated: true } });

    const result = await saveAutomationSettings(payload);
    expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/api/settings/automation'), payload);
    expect(result.updated).toBe(true);
  });
});
