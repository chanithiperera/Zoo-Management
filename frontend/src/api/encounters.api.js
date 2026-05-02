import apiClient from './client';

export const getEncounters = () => apiClient.get('/encounters').then(r => r.data);
export const getEncounterById = (id) => apiClient.get(`/encounters/${id}`).then(r => r.data);
export const createEncounter = (data) => apiClient.post('/encounters', data).then(r => r.data);
export const updateEncounter = (id, data) => apiClient.put(`/encounters/${id}`, data).then(r => r.data);
export const deleteEncounter = (id) => apiClient.delete(`/encounters/${id}`).then(r => r.data);
