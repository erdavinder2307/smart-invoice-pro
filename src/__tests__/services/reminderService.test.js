import axios from 'axios';
import { getReminderSettings, saveReminderSettings } from '../../services/reminderService';

jest.mock('axios');

afterEach(() => jest.clearAllMocks());

describe('reminderService', () => {
  it('fetches reminder settings', async () => {
    const mockData = { enabled: true, days_before: [7, 3, 1] };
    axios.get.mockResolvedValue({ data: mockData });

    const result = await getReminderSettings();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/settings/reminders'));
    expect(result).toEqual(mockData);
  });

  it('saves reminder settings', async () => {
    const payload = { enabled: false, days_before: [14, 7] };
    axios.post.mockResolvedValue({ data: { ...payload, saved: true } });

    const result = await saveReminderSettings(payload);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/settings/reminders'),
      payload
    );
    expect(result.saved).toBe(true);
  });
});
