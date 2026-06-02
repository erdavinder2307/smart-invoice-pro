import axios from 'axios';
import {
  getMe,
  updateMe,
  getPreferences,
  updatePreferences,
  getMeSessions,
  revokeSession,
  changePassword,
} from '../../services/meService';

jest.mock('axios');

beforeEach(() => jest.clearAllMocks());

describe('meService', () => {
  describe('getMe', () => {
    it('returns the current user profile', async () => {
      const user = { id: 'u-1', username: 'davinder', email: 'davinder@test.com' };
      axios.get.mockResolvedValue({ data: user });

      const result = await getMe();

      expect(result).toEqual(user);
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/me'));
    });
  });

  describe('updateMe', () => {
    it('puts updated profile and returns data', async () => {
      const updates = { first_name: 'Davinder', last_name: 'Pal' };
      axios.put.mockResolvedValue({ data: { ...updates, id: 'u-1' } });

      const result = await updateMe(updates);

      expect(result).toMatchObject(updates);
      expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/api/me'), updates);
    });
  });

  describe('getPreferences', () => {
    it('returns user preferences', async () => {
      const prefs = { theme: 'dark', language: 'en' };
      axios.get.mockResolvedValue({ data: prefs });

      const result = await getPreferences();

      expect(result).toEqual(prefs);
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/me/preferences'));
    });
  });

  describe('updatePreferences', () => {
    it('puts updated preferences and returns data', async () => {
      const prefs = { theme: 'light' };
      axios.put.mockResolvedValue({ data: prefs });

      const result = await updatePreferences(prefs);

      expect(result).toEqual(prefs);
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/me/preferences'),
        prefs
      );
    });
  });

  describe('getMeSessions', () => {
    it('returns active sessions', async () => {
      const sessions = [{ id: 'sess-1', device: 'Chrome/macOS' }];
      axios.get.mockResolvedValue({ data: sessions });

      const result = await getMeSessions();

      expect(result).toEqual(sessions);
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/me/sessions'));
    });
  });

  describe('revokeSession', () => {
    it('deletes the specified session', async () => {
      axios.delete.mockResolvedValue({ data: { revoked: true } });

      const result = await revokeSession('sess-1');

      expect(result).toEqual({ revoked: true });
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/api/me/sessions/sess-1')
      );
    });
  });

  describe('changePassword', () => {
    it('puts new password credentials', async () => {
      axios.put.mockResolvedValue({ data: { changed: true } });

      const result = await changePassword({
        current_password: 'old123',
        new_password: 'new456',
      });

      expect(result).toEqual({ changed: true });
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/me/password'),
        { current_password: 'old123', new_password: 'new456' }
      );
    });
  });
});
