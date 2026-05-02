import apiClient from './client';

export const getTickets = () => apiClient.get('/ticket-show').then(r => r.data);
export const getTicketById = (id) => apiClient.get(`/ticket-show/${id}`).then(r => r.data);
export const createTicket = (data) => apiClient.post('/ticket-show', data).then(r => r.data);
export const updateTicket = (id, data) => apiClient.put(`/ticket-show/${id}`, data).then(r => r.data);
export const deleteTicket = (id) => apiClient.delete(`/ticket-show/${id}`).then(r => r.data);
