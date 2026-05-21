import axios from 'axios';
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoiceEmail,
  recordPayment,
  voidInvoice,
} from '../../services/invoiceService';

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
});
