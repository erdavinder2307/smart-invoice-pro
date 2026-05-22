import axios from 'axios';
import { mergeCustomerInto, getCustomers } from '../../services/customerService';

jest.mock('axios');

beforeEach(() => jest.clearAllMocks());

describe('customerService', () => {
  describe('mergeCustomerInto', () => {
    it('posts to the merge endpoint and returns data', async () => {
      const mockData = { message: 'Merged successfully' };
      axios.post.mockResolvedValue({ data: mockData });

      const result = await mergeCustomerInto('src-1', 'tgt-2');

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/customers/src-1/merge-into/tgt-2')
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('getCustomers', () => {
    it('fetches customers with no params', async () => {
      const mockData = [{ id: '1', name: 'Acme' }];
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getCustomers();

      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/customers'));
      expect(result).toEqual(mockData);
    });

    it('fetches customers with query params', async () => {
      axios.get.mockResolvedValue({ data: [] });

      await getCustomers({ search: 'acme', page: 1 });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('search=acme')
      );
    });
  });
});
