import axios from 'axios';
import {
  bulkVendorAction,
  deleteVendorById,
  getVendorsList,
} from '../../services/vendorService';

jest.mock('axios');

beforeEach(() => jest.clearAllMocks());

describe('vendorService', () => {
  it('getVendorsList sends compacted query params and signal', async () => {
    const signal = { aborted: false };
    axios.get.mockResolvedValue({ data: { data: [{ id: 'v1' }] } });

    const result = await getVendorsList(
      {
        page: 1,
        page_size: 10,
        q: 'acme',
        status: '',
        outstanding: null,
        payment_terms: undefined,
      },
      signal
    );

    expect(result).toEqual({ data: [{ id: 'v1' }] });
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/vendors'),
      expect.objectContaining({
        params: {
          page: 1,
          page_size: 10,
          q: 'acme',
        },
        signal,
      })
    );
  });

  it('deleteVendorById deletes by vendor id', async () => {
    axios.delete.mockResolvedValue({ data: { ok: true } });

    const result = await deleteVendorById('vendor-1');

    expect(result).toEqual({ ok: true });
    expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/api/vendors/vendor-1'));
  });

  it('bulkVendorAction posts payload to bulk endpoint', async () => {
    const payload = { action: 'mark_inactive', ids: ['v1', 'v2'] };
    axios.post.mockResolvedValue({ data: { updated: 2 } });

    const result = await bulkVendorAction(payload);

    expect(result).toEqual({ updated: 2 });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/vendors/bulk'),
      payload
    );
  });
});
