import axios from 'axios';
import apiClient from './client';
import { getApiBaseUrl } from './getApiBaseUrl';

const getBaseUrl = () => {
  return getApiBaseUrl();
};

const resolveImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/400';
  if (path.startsWith('http')) return path;
  
  const baseUrl = getBaseUrl();
  // baseUrl is usually http://host:port/api
  const origin = baseUrl.split('/api')[0];
  return `${origin}${path}`;
};

export const fetchAnimals = async (search = '', category = 'All') => {
  try {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);

    const response = await axios.get(`${baseUrl}/animals?${params.toString()}`);
    const animals = response.data.data.map(animal => ({
      ...animal,
      images: animal.images.map(resolveImageUrl),
      educationContent: animal.educationContent?.map(content => ({
        ...content,
        imageUrl: resolveImageUrl(content.imageUrl),
        thumbnail: resolveImageUrl(content.thumbnail)
      }))
    }));
    return { ...response.data, data: animals };
  } catch (error) {
    console.error('Error fetching animals:', error);
    throw error;
  }
};

export const fetchAnimalById = async (id) => {
  try {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/animals/${id}`);
    const animal = {
      ...response.data.data,
      images: response.data.data.images.map(resolveImageUrl),
      educationContent: response.data.data.educationContent?.map(content => ({
        ...content,
        imageUrl: resolveImageUrl(content.imageUrl),
        thumbnail: resolveImageUrl(content.thumbnail)
      }))
    };
    return { ...response.data, data: animal };
  } catch (error) {
    console.error(`Error fetching animal ${id}:`, error);
    throw error;
  }
};

export const fetchRandomFact = async () => {
  try {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/animals/random-fact`);
    return response.data;
  } catch (error) {
    console.error('Error fetching random fact:', error);
    throw error;
  }
};

export const createAnimal = async (animalData) => {
  const response = await apiClient.post('/animals', animalData);
  return response.data;
};

export const updateAnimal = async (id, animalData) => {
  const response = await apiClient.put(`/animals/${id}`, animalData);
  return response.data;
};

export const deleteAnimal = async (id) => {
  const response = await apiClient.delete(`/animals/${id}`);
  return response.data;
};
