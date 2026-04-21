import axios from 'axios';
import { getBranding, updateBranding } from '../../services/brandingService';

jest.mock('axios');

beforeEach(() => jest.clearAllMocks());

describe('brandingService', () => {
  describe('getBranding', () => {
    it('returns branding data', async () => {
      const branding = { primary_color: '#2563EB', secondary_color: '#10B981' };
      axios.get.mockResolvedValue({ data: branding });
      const result = await getBranding();
      expect(result).toEqual(branding);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('403'));
      await expect(getBranding()).rejects.toThrow('403');
    });
  });

  describe('updateBranding', () => {
    it('puts branding payload', async () => {
      const payload = { primary_color: '#FF0000' };
      axios.put.mockResolvedValue({ data: { ...payload, updated: true } });
      const result = await updateBranding(payload);
      expect(result).toEqual({ primary_color: '#FF0000', updated: true });
      expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/branding'), payload);
    });
  });
});
