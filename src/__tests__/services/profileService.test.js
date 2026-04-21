import axios from 'axios';
import { getProfile, updateProfile } from '../../services/profileService';

jest.mock('axios');

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('profileService', () => {
  const mockUser = { id: 'user-1', username: 'admin' };

  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify(mockUser));
  });

  it('fetches user profile', async () => {
    const mockData = { id: 'user-1', username: 'admin', email: 'admin@test.com' };
    axios.get.mockResolvedValue({ data: mockData });

    const result = await getProfile();
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/profile/me'),
      { headers: { 'X-User-Id': 'user-1', 'X-Username': 'admin' } }
    );
    expect(result).toEqual(mockData);
  });

  it('updates user profile', async () => {
    const payload = { display_name: 'Admin User', email: 'new@test.com' };
    axios.post.mockResolvedValue({ data: { ...payload, updated: true } });

    const result = await updateProfile(payload);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/profile/update'),
      payload,
      { headers: { 'X-User-Id': 'user-1', 'X-Username': 'admin' } }
    );
    expect(result.updated).toBe(true);
  });

  it('throws on error', async () => {
    axios.get.mockRejectedValue(new Error('Unauthorized'));
    await expect(getProfile()).rejects.toThrow('Unauthorized');
  });
});
