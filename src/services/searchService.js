import axios from 'axios';
import { createApiUrl } from '../config/api';

export const searchGlobal = async (query, limit = 5) => {
  const response = await axios.get(createApiUrl('/api/search'), {
    params: { q: query, limit },
  });
  return response.data;
};

export const getSearchHistory = async (arg = 5) => {
  const options = typeof arg === 'number' ? { limit: arg } : (arg || {});
  const params = {
    limit: options.limit ?? 5,
    ...(options.page ? { page: options.page } : {}),
  };
  const response = await axios.get(createApiUrl('/api/search/history'), {
    params,
  });
  return response.data;
};

export const saveSearchHistory = async (payload) => {
  const normalizedPayload = {
    ...payload,
    query: (payload?.query || '').trim(),
  };
  const response = await axios.post(createApiUrl('/api/search/history'), normalizedPayload);
  return response.data;
};

export const deleteSearchHistoryItem = async (historyId) => {
  const response = await axios.delete(createApiUrl(`/api/search/history/${historyId}`));
  return response.data;
};

export const clearSearchHistory = async (page) => {
  const response = await axios.delete(createApiUrl('/api/search/history'), {
    params: page ? { page } : undefined,
  });
  return response.data;
};

export const getRecentlyViewed = async (limit = 5) => {
  const response = await axios.get(createApiUrl('/api/search/recently-viewed'), {
    params: { limit },
  });
  return response.data;
};

export const trackRecentlyViewed = async (payload) => {
  const response = await axios.post(createApiUrl('/api/search/recently-viewed'), payload);
  return response.data;
};

export const deleteRecentlyViewedItem = async (itemId) => {
  const response = await axios.delete(createApiUrl(`/api/search/recently-viewed/${itemId}`));
  return response.data;
};

export const clearRecentlyViewed = async () => {
  const response = await axios.delete(createApiUrl('/api/search/recently-viewed'));
  return response.data;
};

