import axios from 'axios';
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
} from '../../services/notificationService';

jest.mock('axios');

beforeEach(() => jest.clearAllMocks());

describe('notificationService', () => {
  describe('getNotifications', () => {
    it('returns notifications with default params', async () => {
      const data = { notifications: [{ id: '1' }], unread_count: 1 };
      axios.get.mockResolvedValue({ data });
      const result = await getNotifications();
      expect(result).toEqual(data);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/notifications'),
        { params: { limit: 50, unread_only: false } }
      );
    });

    it('passes custom params', async () => {
      axios.get.mockResolvedValue({ data: { notifications: [], unread_count: 0 } });
      await getNotifications({ limit: 10, unreadOnly: true });
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        { params: { limit: 10, unread_only: true } }
      );
    });
  });

  describe('markNotificationRead', () => {
    it('marks a single notification as read', async () => {
      axios.put.mockResolvedValue({ data: { success: true } });
      const result = await markNotificationRead('n-1');
      expect(result).toEqual({ success: true });
      expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/notifications/n-1/read'));
    });
  });

  describe('markAllRead', () => {
    it('marks all notifications as read', async () => {
      axios.put.mockResolvedValue({ data: { success: true } });
      const result = await markAllRead();
      expect(result).toEqual({ success: true });
    });
  });
});
