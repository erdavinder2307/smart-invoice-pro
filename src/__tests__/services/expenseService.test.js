import axios from 'axios';
import { getExpenseById, exportExpenses } from '../../services/expenseService';

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

describe('expenseService', () => {
  describe('getExpenseById', () => {
    it('returns expense data by id', async () => {
      const expense = { id: 'exp-1', vendor_name: 'Staples', amount: 500 };
      axios.get.mockResolvedValue({ data: expense });

      const result = await getExpenseById('exp-1');

      expect(result).toEqual(expense);
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/expenses/exp-1'));
    });

    it('propagates errors from the API', async () => {
      axios.get.mockRejectedValue(new Error('Not found'));
      await expect(getExpenseById('bad-id')).rejects.toThrow('Not found');
    });
  });

  describe('exportExpenses', () => {
    it('calls export endpoint and triggers download', async () => {
      axios.get.mockResolvedValue({ data: new Blob(['csv,data'], { type: 'text/csv' }) });

      await exportExpenses({ status: 'Paid', q: 'food' });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/expenses/export'),
        expect.objectContaining({
          params: { status: 'Paid', q: 'food' },
          responseType: 'blob',
        })
      );
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('strips empty/null/undefined params before sending', async () => {
      axios.get.mockResolvedValue({ data: new Blob([]) });

      await exportExpenses({ status: '', category: null, q: undefined, vendor: 'Staples' });

      const call = axios.get.mock.calls[0];
      expect(call[1].params).toEqual({ vendor: 'Staples' });
    });
  });
});
