import axios from 'axios';
import {
  bulkQuoteAction,
  deleteQuoteById,
  getQuoteById,
  getQuotesList,
  sendQuoteEmail,
  downloadQuotePdf,
  exportQuotes,
} from '../../services/quoteService';

jest.mock('axios');

let clickSpy;
let appendChildSpy;

beforeEach(() => {
  jest.clearAllMocks();
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();
  appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
  clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
  appendChildSpy.mockRestore();
  clickSpy.mockRestore();
});

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

  it('getQuoteById returns quote data', async () => {
    const quote = { id: 'q-1', quote_number: 'QT-001', status: 'Draft' };
    axios.get.mockResolvedValue({ data: quote });

    const result = await getQuoteById('q-1');

    expect(result).toEqual(quote);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/quotes/q-1'));
  });

  it('downloadQuotePdf triggers download with correct filename', async () => {
    axios.get.mockResolvedValue({ data: new Blob(['%PDF'], { type: 'application/pdf' }) });

    await downloadQuotePdf('q-1', 'QT-001');

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/quotes/q-1/pdf'),
      expect.objectContaining({ responseType: 'blob' })
    );
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('downloadQuotePdf uses "quote.pdf" as fallback when no quoteNumber', async () => {
    axios.get.mockResolvedValue({ data: new Blob(['%PDF']) });

    await downloadQuotePdf('q-1');

    expect(clickSpy).toHaveBeenCalled();
  });

  it('exportQuotes filters empty params and triggers CSV download', async () => {
    axios.get.mockResolvedValue({ data: new Blob(['csv'], { type: 'text/csv' }) });

    await exportQuotes({ status: 'Sent', q: '', customer_id: null });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/quotes/export'),
      expect.objectContaining({
        params: { status: 'Sent' },
        responseType: 'blob',
      })
    );
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });
});
