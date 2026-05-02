import apiClient from './client';

export const getEvents = () => apiClient.get('/events').then(r => r.data);
export const getEventById = (id) => apiClient.get(`/events/${id}`).then(r => r.data);
export const createEvent = (data) => apiClient.post('/events', data).then(r => r.data);
export const updateEvent = (id, data) => apiClient.put(`/events/${id}`, data).then(r => r.data);
export const deleteEvent = (id) => apiClient.delete(`/events/${id}`).then(r => r.data);
