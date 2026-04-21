import axios from 'axios';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/productService';

jest.mock('axios');

beforeEach(() => jest.clearAllMocks());

describe('productService', () => {
  const mockProduct = { id: 'p-1', name: 'Widget', price: 9.99 };

  describe('getProducts', () => {
    it('returns products list', async () => {
      axios.get.mockResolvedValue({ data: [mockProduct] });
      const result = await getProducts();
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('createProduct', () => {
    it('posts product and returns data', async () => {
      axios.post.mockResolvedValue({ data: mockProduct });
      const result = await createProduct(mockProduct);
      expect(result).toEqual(mockProduct);
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/products'), mockProduct);
    });
  });

  describe('updateProduct', () => {
    it('puts updated product', async () => {
      const updated = { ...mockProduct, price: 19.99 };
      axios.put.mockResolvedValue({ data: updated });
      const result = await updateProduct('p-1', updated);
      expect(result).toEqual(updated);
      expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/products/p-1'), updated);
    });
  });

  describe('deleteProduct', () => {
    it('deletes product by id', async () => {
      axios.delete.mockResolvedValue({ data: { message: 'deleted' } });
      const result = await deleteProduct('p-1');
      expect(result).toEqual({ message: 'deleted' });
    });
  });
});
