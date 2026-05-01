import axios from 'axios';
import {
  bulkQuoteAction,
  deleteQuoteById,
  getQuotesList,
  sendQuoteEmail,
} from '../../services/quoteService';

jest.mock('axios');

beforeEach(() => jest.clearAllMocks());

describe('quoteService', () => {
  it('getQuotesList compacts params and forwards signal', async () => {
    const signal = { aborted: false };
    axios.get.mockResolvedValue({ data: { items: [{ id: 'q-1' }], total: 1 } });

    const result = await getQuotesList(
      {
        page: 1,
        page_size: 10,
        q: 'acme',
        status: '',
        min_amount: null,
      },
      signal
    );

    expect(result).toEqual({ items: [{ id: 'q-1' }], total: 1 });
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/quotes'),
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

  it('bulkQuoteAction posts payload', async () => {
    const payload = { action: 'delete', ids: ['q-1', 'q-2'] };
    axios.post.mockResolvedValue({ data: { deleted: 2 } });

    const result = await bulkQuoteAction(payload);

    expect(result).toEqual({ deleted: 2 });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/quotes/bulk'),
      payload
    );
  });

  it('deleteQuoteById deletes by id', async () => {
    axios.delete.mockResolvedValue({ data: { ok: true } });

    const result = await deleteQuoteById('q-1');

    expect(result).toEqual({ ok: true });
    expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/api/quotes/q-1'));
  });

  it('sendQuoteEmail posts email payload', async () => {
    const payload = { recipient_email: 'buyer@acme.in', message: 'Please review.' };
    axios.post.mockResolvedValue({ data: { sent: true } });

    const result = await sendQuoteEmail('q-1', payload);

    expect(result).toEqual({ sent: true });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/quotes/q-1/send-email'),
      payload
    );
  });
});
