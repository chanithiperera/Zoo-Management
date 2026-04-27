import client from './client';

export const createOrder = (data) => client.post('/orders', data);
export const getMyOrders = () => client.get('/orders/mine');
export const getAllOrders = () => client.get('/orders');
export const getOrderById = (id) => client.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => client.patch(`/orders/${id}/status`, { status });
export const cancelOrder = (id) => client.patch(`/orders/${id}/cancel`);
export const deleteOrder = (id) => client.delete(`/orders/${id}`);
