import apiClient from './client';

export async function register(payload) {
  const res = await apiClient.post('/auth/register', payload);
  return res.data;
}

export async function login(payload) {
  const res = await apiClient.post('/auth/login', payload);
  return res.data;
}

export async function getMe() {
  const res = await apiClient.get('/auth/me');
  return res.data;
}

export async function updateProfile(payload) {
  const res = await apiClient.patch('/auth/me', payload);
  return res.data;
}

export async function changePassword(payload) {
  const res = await apiClient.patch('/auth/me/password', payload);
  return res.data;
}
