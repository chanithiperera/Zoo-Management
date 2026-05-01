import axios from 'axios';
import { getApiBaseUrl } from './getApiBaseUrl';

const getBaseUrl = () => {
  return getApiBaseUrl();
};

export const fetchAnimals = async (search = '', category = 'All') => {
  try {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);

    const response = await axios.get(`${baseUrl}/animals?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching animals:', error);
    throw error;
  }
};

export const fetchAnimalById = async (id) => {
  try {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/animals/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching animal ${id}:`, error);
    throw error;
  }
};
