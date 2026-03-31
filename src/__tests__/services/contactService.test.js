import axios from 'axios';
import { contactService } from '../../services/contactService';

jest.mock('axios');

afterEach(() => jest.clearAllMocks());

describe('contactService', () => {
  it('sends a contact message', async () => {
    const payload = { name: 'John', email: 'john@test.com', message: 'Hello' };
    axios.post.mockResolvedValue({ data: { success: true } });

    const result = await contactService.sendMessage(payload);
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/contact'), payload);
    expect(result.success).toBe(true);
  });

  it('throws on error', async () => {
    axios.post.mockRejectedValue(new Error('Failed'));
    await expect(contactService.sendMessage({})).rejects.toThrow('Failed');
  });
});
