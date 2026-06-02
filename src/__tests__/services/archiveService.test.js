import axios from 'axios';
import {
  checkDependencies,
  archiveEntity,
  restoreEntity,
} from '../../services/archiveService';

jest.mock('axios');

beforeEach(() => jest.clearAllMocks());

describe('archiveService', () => {
  describe('checkDependencies', () => {
    it('calls lifecycle analysis endpoint for product', async () => {
      const analysisData = { hasDependencies: true, dependencySummary: { invoices: 3 } };
      axios.get.mockResolvedValue({ data: analysisData });

      const result = await checkDependencies('product', 'prod-1');

      expect(result).toEqual(analysisData);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/lifecycle/products/prod-1/analysis')
      );
    });

    it('resolves correct path for vendor', async () => {
      axios.get.mockResolvedValue({ data: {} });
      await checkDependencies('vendor', 'v-1');
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/lifecycle/vendors/v-1/analysis')
      );
    });

    it('throws for unsupported entity type', async () => {
      await expect(checkDependencies('unknown', 'id-1')).rejects.toThrow(
        'Unsupported archive entity type: unknown'
      );
    });

    it('propagates API errors', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));
      await expect(checkDependencies('customer', 'c-1')).rejects.toThrow('Network error');
    });
  });

  describe('archiveEntity', () => {
    it('posts archive action for invoice', async () => {
      const result = { status: 'archived' };
      axios.post.mockResolvedValue({ data: result });

      const res = await archiveEntity('invoice', 'inv-1');

      expect(res).toEqual(result);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/lifecycle/invoices/inv-1/execute'),
        { action: 'archive' }
      );
    });

    it('resolves salesorder alias correctly', async () => {
      axios.post.mockResolvedValue({ data: {} });
      await archiveEntity('salesorder', 'so-1');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/lifecycle/sales-orders/so-1/execute'),
        { action: 'archive' }
      );
    });

    it('throws for unsupported entity type', async () => {
      await expect(archiveEntity('unknown_type', 'id-1')).rejects.toThrow(
        'Unsupported archive entity type: unknown_type'
      );
    });
  });

  describe('restoreEntity', () => {
    it('posts restore action for customer', async () => {
      const result = { status: 'active' };
      axios.post.mockResolvedValue({ data: result });

      const res = await restoreEntity('customer', 'c-1');

      expect(res).toEqual(result);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/lifecycle/customers/c-1/execute'),
        { action: 'restore' }
      );
    });

    it('resolves purchase_order alias correctly', async () => {
      axios.post.mockResolvedValue({ data: {} });
      await restoreEntity('purchase_order', 'po-1');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/lifecycle/purchase-orders/po-1/execute'),
        { action: 'restore' }
      );
    });

    it('throws for unsupported entity type', async () => {
      await expect(restoreEntity('unknown', 'id-1')).rejects.toThrow(
        'Unsupported archive entity type: unknown'
      );
    });
  });
});
