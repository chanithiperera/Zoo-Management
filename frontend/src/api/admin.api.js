import apiClient from './client';

export async function getUsers() {
  const res = await apiClient.get('/admin/users');
  return res.data;
}

export async function updateUser(id, payload) {
  const res = await apiClient.patch(`/admin/users/${id}`, payload);
  return res.data;
}

export async function deleteUser(id) {
  const res = await apiClient.delete(`/admin/users/${id}`);
  return res.data;
}
