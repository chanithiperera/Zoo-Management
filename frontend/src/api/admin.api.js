import apiClient from './client';

export async function getUsers() {
  const res = await apiClient.get('/admin/users');
  return res.data;
}

export async function updateUser(id, payload) {
  const res = await apiClient.patch(`/admin/users/${id}`, payload);
  return res.data;
}

export async function createUser(payload) {
  try {
    const res = await apiClient.post('/admin/users', payload);
    return res.data;
  } catch (error) {
    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || '').toLowerCase();
    const isMissingCreateRoute =
      status === 404 && (message.includes('route not found') || message.includes('/api/admin/users'));
    if (!isMissingCreateRoute) {
      throw error;
    }

    // Backward-compatible fallback for servers that don't yet expose POST /admin/users.
    // 1) Create a visitor via public register endpoint.
    const registerRes = await apiClient.post('/auth/register', {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
    });
    const createdUser = registerRes?.data?.data?.user;

    // 2) Promote to admin if requested (PATCH /admin/users/:id already exists in current app flow).
    if (createdUser?._id && payload.role === 'admin') {
      const promoteRes = await apiClient.patch(`/admin/users/${createdUser._id}`, {
        fullName: createdUser.fullName,
        email: createdUser.email,
        phone: createdUser.phone,
        role: 'admin',
      });
      return promoteRes.data;
    }

    return {
      success: true,
      message: registerRes?.data?.message || 'User created',
      data: { user: createdUser },
    };
  }
}

export async function deleteUser(id) {
  const res = await apiClient.delete(`/admin/users/${id}`);
  return res.data;
}

export async function getAdminTicketCatalog() {
  const res = await apiClient.get('/admin/ticket-catalog');
  return res.data;
}

export async function updateEntryTicket(id, payload) {
  const res = await apiClient.patch(`/admin/ticket-catalog/entry/${id}`, payload);
  return res.data;
}

export async function updateShowTicket(id, payload) {
  const res = await apiClient.patch(`/admin/ticket-catalog/shows/${id}`, payload);
  return res.data;
}

export async function createShowTicket(payload) {
  const res = await apiClient.post('/admin/ticket-catalog/shows', payload);
  return res.data;
}

export async function deleteTicketCatalogItem(id) {
  const res = await apiClient.delete(`/admin/ticket-catalog/${id}`);
  return res.data;
}

export async function getAdminBookingsByDate(visitDate) {
  const params = {};
  if (visitDate) params.visitDate = visitDate;
  const res = await apiClient.get('/admin/bookings', { params });
  return res.data;
}

export async function getAdminGroupBookings(status) {
  const params = {};
  if (status) params.status = status;
  const res = await apiClient.get('/admin/group-bookings', { params });
  return res.data;
}
