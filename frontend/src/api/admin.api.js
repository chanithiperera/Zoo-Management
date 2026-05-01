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

/** Upload a show poster image; returns `{ success, data: { imageUrl } }` with a path like `/uploads/ticket-show/...`. */
export async function uploadShowPosterImage(asset) {
  const formData = new FormData();
  const name = asset.fileName || `show-poster-${Date.now()}.jpg`;
  const type = asset.mimeType || 'image/jpeg';
  if (typeof File !== 'undefined' && asset.file instanceof File) {
    formData.append('photo', asset.file);
  } else {
    formData.append('photo', { uri: asset.uri, name, type });
  }
  const res = await apiClient.post('/admin/ticket-catalog/shows/upload-poster', formData);
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

export async function updateAdminGroupBookingStatus(id, payload) {
  const res = await apiClient.patch(`/admin/group-bookings/${id}/status`, payload);
  return res.data;
}

export async function checkInBooking(code) {
  const res = await apiClient.post('/admin/bookings/check-in', { code });
  return res.data;
}

export async function downloadAdminGroupBookingDocument(id) {
  const res = await apiClient.get(`/admin/group-bookings/${id}/document`, {
    responseType: 'blob',
  });
  return {
    blob: res.data,
    contentType: res.headers?.['content-type'],
    contentDisposition: res.headers?.['content-disposition'],
  };
}
