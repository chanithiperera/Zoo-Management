import apiClient from './client';

export const fetchEncounterAnimals = async () => {
  const response = await apiClient.get('/encounter-animals');
  return response.data;
};

export const createEncounterAnimal = async (formData) => {
  const response = await apiClient.post('/encounter-animals', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateEncounterAnimal = async (id, formData) => {
  const response = await apiClient.patch(`/encounter-animals/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteEncounterAnimal = async (id) => {
  const response = await apiClient.delete(`/encounter-animals/${id}`);
  return response.data;
};
