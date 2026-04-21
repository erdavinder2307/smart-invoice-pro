import axios from 'axios';
import {
  clearSearchHistory,
  deleteSearchHistoryItem,
  getSearchHistory,
  saveSearchHistory,
  searchGlobal,
} from '../../services/searchService';

jest.mock('axios');

beforeEach(() => jest.clearAllMocks());

describe('searchService', () => {
  it('searchGlobal fetches grouped search results', async () => {
    axios.get.mockResolvedValue({ data: { total: 1, results: { customers: [{ id: 'c1' }] } } });

    const result = await searchGlobal('acme', 5);

    expect(result.total).toBe(1);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/search'),
      expect.objectContaining({ params: { q: 'acme', limit: 5 } })
    );
  });

  it('getSearchHistory fetches recent items', async () => {
    axios.get.mockResolvedValue({ data: [{ id: 'h1', query: 'acme' }] });

    const result = await getSearchHistory(7);

    expect(result).toEqual([{ id: 'h1', query: 'acme' }]);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/search/history'),
      expect.objectContaining({ params: { limit: 7 } })
    );
  });

  it('saveSearchHistory posts a history payload', async () => {
    axios.post.mockResolvedValue({ data: { id: 'h2' } });

    const payload = { query: 'INV-101', type: 'entity', entity_id: 'inv-1', entity_type: 'invoice' };
    const result = await saveSearchHistory(payload);

    expect(result).toEqual({ id: 'h2' });
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/search/history'), payload);
  });

  it('deleteSearchHistoryItem removes one history item', async () => {
    axios.delete.mockResolvedValue({ data: { message: 'Deleted' } });

    const result = await deleteSearchHistoryItem('h1');

    expect(result.message).toBe('Deleted');
    expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/api/search/history/h1'));
  });

  it('clearSearchHistory removes all items', async () => {
    axios.delete.mockResolvedValue({ data: { message: 'Search history cleared' } });

    const result = await clearSearchHistory();

    expect(result.message).toContain('cleared');
    expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/api/search/history'));
  });
});
