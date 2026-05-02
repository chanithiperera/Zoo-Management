import client from './client';

export const getCategories = () => client.get('/store/categories');
export const createCategory = (data) => client.post('/store/categories', data);
export const updateCategory = (id, data) => client.put(`/store/categories/${id}`, data);
export const deleteCategory = (id) => client.delete(`/store/categories/${id}`);

export const getProducts = (params) => client.get('/store/products', { params });
export const getProductById = (id) => client.get(`/store/products/${id}`);
export const createProduct = (data) => {
  const isFormData = data instanceof FormData;
  return client.post('/store/products', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
  });
};

export const updateProduct = (id, data) => {
  const isFormData = data instanceof FormData;
  return client.put(`/store/products/${id}`, data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
  });
};

export const deleteProduct = (id) => client.delete(`/store/products/${id}`);
