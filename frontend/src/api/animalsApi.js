import axios from 'axios';
import apiClient from './client';
import { getApiBaseUrl, resolveUploadsFileUri } from './getApiBaseUrl';

const getBaseUrl = () => {
  return getApiBaseUrl();
};

/** Resolve a stored `/uploads/...` path or absolute URL for display.fetch */
const resolveImageUrl = (path) => {
  if (path == null) return null;
  const s = String(path).trim();
  if (!s) return null;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  return resolveUploadsFileUri(s);
};

/**
 * Backend stores a single `imageUrl`; older clients may send `images` array.
 * Public screens expect `images: string[]` of absolute URLs.
 */
function collectResolvedImages(animal) {
  const rawPaths = [];
  if (Array.isArray(animal.images)) {
    animal.images.forEach((x) => {
      if (x != null && String(x).trim()) rawPaths.push(String(x).trim());
    });
  }
  if (animal.imageUrl && String(animal.imageUrl).trim()) {
    const u = String(animal.imageUrl).trim();
    if (!rawPaths.includes(u)) rawPaths.push(u);
  }
  const urls = rawPaths.map(resolveImageUrl).filter(Boolean);
  return urls;
}

export const fetchAnimals = async (search = '', category = 'All') => {
  try {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);

    const response = await axios.get(`${baseUrl}/animals?${params.toString()}`);
    const animals = response.data.data.map(animal => ({
      ...animal,
      images: collectResolvedImages(animal),
      educationContent: animal.educationContent?.map(content => ({
        ...content,
        imageUrl: resolveImageUrl(content.imageUrl) ?? content.imageUrl,
        thumbnail: resolveImageUrl(content.thumbnail) ?? content.thumbnail,
      })),
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
    const raw = response.data.data;
    const animal = {
      ...raw,
      images: collectResolvedImages(raw),
      educationContent: raw.educationContent?.map(content => ({
        ...content,
        imageUrl: resolveImageUrl(content.imageUrl) ?? content.imageUrl,
        thumbnail: resolveImageUrl(content.thumbnail) ?? content.thumbnail,
      })),
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

function appendAnimalMultipartFields(form, animalData) {
  form.append('name', animalData.name);
  form.append('species', animalData.species);
  form.append('category', animalData.category);
  form.append('description', animalData.description);
  form.append('habitat', animalData.habitat ?? '');
  form.append('diet', animalData.diet ?? '');
  form.append('lifespan', animalData.lifespan ?? 'Unknown');
  form.append('weight', animalData.weight ?? 'Unknown');
  form.append('conservationStatus', animalData.conservationStatus);
  form.append('funFacts', JSON.stringify(Array.isArray(animalData.funFacts) ? animalData.funFacts : []));
}

/**
 * @param {object} animalData - normalized fields (funFacts as array)
 * @param {object | null} imagePart - RN FormData file `{ uri, name, type }` from buildImageFormPart
 */
export const createAnimal = async (animalData, imagePart = null) => {
  if (imagePart) {
    const form = new FormData();
    appendAnimalMultipartFields(form, animalData);
    form.append('image', imagePart);
    const response = await apiClient.post('/animals', form);
    return response.data;
  }
  const response = await apiClient.post('/animals', animalData);
  return response.data;
};

export const updateAnimal = async (id, animalData, imagePart = null) => {
  if (imagePart) {
    const form = new FormData();
    appendAnimalMultipartFields(form, animalData);
    form.append('image', imagePart);
    const response = await apiClient.patch(`/animals/${id}`, form);
    return response.data;
  }
  const response = await apiClient.patch(`/animals/${id}`, animalData);
  return response.data;
};

export const deleteAnimal = async (id) => {
  const response = await apiClient.delete(`/animals/${id}`);
  return response.data;
};
