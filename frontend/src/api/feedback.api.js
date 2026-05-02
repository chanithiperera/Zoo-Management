import apiClient from './client';

export const getFeedback = (params = {}) => apiClient.get('/feedback', { params }).then(r => r.data);
export const getFeedbackById = (id) => apiClient.get(`/feedback/${id}`).then(r => r.data);
export const submitFeedback = (data) => apiClient.post('/feedback', data).then(r => r.data);
export const updateFeedbackStatus = (id, status, adminNote = '') =>
  apiClient.patch(`/feedback/${id}/status`, { status, adminNote }).then(r => r.data);
export const deleteFeedback = (id) => apiClient.delete(`/feedback/${id}`).then(r => r.data);
