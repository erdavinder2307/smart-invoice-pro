import axios from 'axios';
import {
  getInvoices,
  getInvoicesList,
  bulkInvoiceAction,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoiceEmail,
  recordPayment,
  voidInvoice,
  exportInvoices,
} from '../../services/invoiceService';

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

jest.mock('axios');

beforeEach(() => jest.clearAllMocks());

describe('invoiceService', () => {
  const mockInvoice = { id: 'inv-1', customer_name: 'Acme', total: 100 };

  describe('getInvoices', () => {
    it('returns list of invoices', async () => {
      axios.get.mockResolvedValue({ data: [mockInvoice] });
      const result = await getInvoices();
      expect(result).toEqual([mockInvoice]);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('500'));
      await expect(getInvoices()).rejects.toThrow('500');
    });
  });

  describe('createInvoice', () => {
    it('posts invoice and returns data', async () => {
      axios.post.mockResolvedValue({ data: mockInvoice });
      const result = await createInvoice(mockInvoice);
      expect(result).toEqual(mockInvoice);
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/invoices'), mockInvoice);
    });
  });

  describe('updateInvoice', () => {
    it('puts updated invoice', async () => {
      const updated = { ...mockInvoice, total: 200 };
      axios.put.mockResolvedValue({ data: updated });
      const result = await updateInvoice('inv-1', updated);
      expect(result).toEqual(updated);
      expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/invoices/inv-1'), updated);
    });
  });

  describe('deleteInvoice', () => {
    it('deletes invoice by id', async () => {
      axios.delete.mockResolvedValue({ data: { message: 'deleted' } });
      const result = await deleteInvoice('inv-1');
      expect(result).toEqual({ message: 'deleted' });
      expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/invoices/inv-1'));
    });
  });

  describe('sendInvoiceEmail', () => {
    it('sends email for invoice', async () => {
      const payload = { to: 'test@example.com' };
      axios.post.mockResolvedValue({ data: { sent: true } });
      const result = await sendInvoiceEmail('inv-1', payload);
      expect(result).toEqual({ sent: true });
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/invoices/inv-1/send-email'),
        payload
      );
    });
  });

  describe('recordPayment', () => {
    it('records payment for invoice', async () => {
      const payload = { amount: 50, method: 'cash' };
      axios.post.mockResolvedValue({ data: { recorded: true } });
      const result = await recordPayment('inv-1', payload);
      expect(result).toEqual({ recorded: true });
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/invoices/inv-1/record-payment'),
        payload
      );
    });
  });

  describe('voidInvoice', () => {
    it('voids an invoice with a reason', async () => {
      axios.post.mockResolvedValue({ data: { status: 'Cancelled', invoice_id: 'inv-1' } });
      const result = await voidInvoice('inv-1', 'Issued in error');
      expect(result).toEqual({ status: 'Cancelled', invoice_id: 'inv-1' });
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/invoices/inv-1/void'),
        { reason: 'Issued in error' }
      );
    });

    it('propagates errors from the API', async () => {
      axios.post.mockRejectedValue(new Error('Server error'));
      await expect(voidInvoice('inv-1', 'Mistake')).rejects.toThrow('Server error');
    });
  });

  describe('getInvoicesList', () => {
    it('compacts params, forwards signal, returns data', async () => {
      const signal = { aborted: false };
      axios.get.mockResolvedValue({ data: { items: [mockInvoice], total: 1 } });

      const result = await getInvoicesList(
        { page: 1, status: '', q: 'acme', min_amount: null },
        signal
      );

      expect(result).toEqual({ items: [mockInvoice], total: 1 });
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/invoices'),
        expect.objectContaining({
          params: { page: 1, q: 'acme' },
          signal,
        })
      );
    });
  });

  describe('bulkInvoiceAction', () => {
    it('posts bulk payload and returns data', async () => {
      const payload = { action: 'delete', ids: ['inv-1', 'inv-2'] };
      axios.post.mockResolvedValue({ data: { deleted: 2 } });

      const result = await bulkInvoiceAction(payload);

      expect(result).toEqual({ deleted: 2 });
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/invoices/bulk'),
        payload
      );
    });
  });

  describe('exportInvoices', () => {
    it('calls export endpoint, filters empty params, triggers CSV download', async () => {
      axios.get.mockResolvedValue({ data: new Blob(['csv'], { type: 'text/csv' }) });

      await exportInvoices({ status: 'Paid', q: '', customer_id: null });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/invoices/export'),
        expect.objectContaining({
          params: { status: 'Paid' },
          responseType: 'blob',
        })
      );
      expect(clickSpy).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});
