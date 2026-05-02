import apiClient from './client';

export async function getTicketCatalog() {
  const res = await apiClient.get('/ticket-show/catalog');
  return res.data;
}

export async function createBooking(payload) {
  const res = await apiClient.post('/ticket-show/bookings', payload);
  return res.data;
}

export async function getMyBookings() {
  const res = await apiClient.get('/ticket-show/bookings/me');
  return res.data;
}

export async function getMyBooking(id) {
  const res = await apiClient.get(`/ticket-show/bookings/${id}`);
  return res.data;
}

export async function verifyBookingEntry(payload) {
  const res = await apiClient.post('/ticket-show/bookings/verify-entry', payload);
  return res.data;
}
