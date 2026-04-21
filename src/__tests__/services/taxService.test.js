import axios from 'axios';
import { getTaxRates, createTaxRate, updateTaxRate, deleteTaxRate, getGstConfig } from '../../services/taxService';

jest.mock('axios');

beforeEach(() => jest.clearAllMocks());

describe('taxService', () => {
  const mockTax = { id: 't-1', name: 'GST 18%', rate: 18 };

  describe('getTaxRates', () => {
    it('returns tax rates', async () => {
      axios.get.mockResolvedValue({ data: [mockTax] });
      const result = await getTaxRates();
      expect(result).toEqual([mockTax]);
    });
  });

  describe('createTaxRate', () => {
    it('creates a tax rate', async () => {
      axios.post.mockResolvedValue({ data: mockTax });
      const result = await createTaxRate(mockTax);
      expect(result).toEqual(mockTax);
    });
  });

  describe('updateTaxRate', () => {
    it('updates a tax rate by id', async () => {
      const updated = { ...mockTax, rate: 12 };
      axios.put.mockResolvedValue({ data: updated });
      const result = await updateTaxRate('t-1', updated);
      expect(result).toEqual(updated);
    });
  });

  describe('deleteTaxRate', () => {
    it('deletes a tax rate by id', async () => {
      axios.delete.mockResolvedValue({ data: { deleted: true } });
      const result = await deleteTaxRate('t-1');
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('getGstConfig', () => {
    it('returns GST config', async () => {
      const config = { gst_number: 'GST123', state: 'Maharashtra' };
      axios.get.mockResolvedValue({ data: config });
      const result = await getGstConfig();
      expect(result).toEqual(config);
    });
  });
});
