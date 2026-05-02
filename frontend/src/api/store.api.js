import apiClient from './client';

export const getStoreItems = () => apiClient.get('/store').then(r => r.data);
export const getStoreItemById = (id) => apiClient.get(`/store/${id}`).then(r => r.data);
export const createStoreItem = (data) => apiClient.post('/store', data).then(r => r.data);
export const updateStoreItem = (id, data) => apiClient.put(`/store/${id}`, data).then(r => r.data);
export const deleteStoreItem = (id) => apiClient.delete(`/store/${id}`).then(r => r.data);
