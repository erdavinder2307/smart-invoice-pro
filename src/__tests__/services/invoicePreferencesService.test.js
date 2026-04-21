import axios from 'axios';
import { getInvoicePreferences, updateInvoicePreferences } from '../../services/invoicePreferencesService';

jest.mock('axios');

afterEach(() => jest.clearAllMocks());

describe('invoicePreferencesService', () => {
  it('fetches invoice preferences', async () => {
    const mockData = { prefix: 'INV-', next_number: 1001, padding: 4 };
    axios.get.mockResolvedValue({ data: mockData });

    const result = await getInvoicePreferences();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/settings/invoice-preferences'));
    expect(result).toEqual(mockData);
  });

  it('updates invoice preferences', async () => {
    const payload = { prefix: 'INV-', next_number: 2000 };
    axios.put.mockResolvedValue({ data: { ...payload, updated: true } });

    const result = await updateInvoicePreferences(payload);
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/api/settings/invoice-preferences'),
      payload
    );
    expect(result.updated).toBe(true);
  });
});
