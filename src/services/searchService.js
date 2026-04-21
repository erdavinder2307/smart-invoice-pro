import axios from 'axios';
import { createApiUrl } from '../config/api';

export const searchGlobal = async (query, limit = 5) => {
  const response = await axios.get(createApiUrl('/api/search'), {
    params: { q: query, limit },
  });
  return response.data;
};

export const getSearchHistory = async (limit = 5) => {
  const response = await axios.get(createApiUrl('/api/search/history'), {
    params: { limit },
  });
  return response.data;
};

export const saveSearchHistory = async (payload) => {
  const response = await axios.post(createApiUrl('/api/search/history'), payload);
  return response.data;
};

export const deleteSearchHistoryItem = async (historyId) => {
  const response = await axios.delete(createApiUrl(`/api/search/history/${historyId}`));
  return response.data;
};

export const clearSearchHistory = async () => {
  const response = await axios.delete(createApiUrl('/api/search/history'));
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

