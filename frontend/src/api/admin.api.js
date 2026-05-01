import { Platform } from 'react-native';
import apiClient from './client';
import { getApiBaseUrl } from './getApiBaseUrl';
import { getToken } from '../services/tokenStorage';

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

/**
 * Binary download uses `fetch` + `arrayBuffer()` because axios `responseType: 'arraybuffer'`
 * is unreliable on React Native (response data shape / parsing issues).
 */
export async function downloadAdminGroupBookingDocument(id) {
  const baseUrl = getApiBaseUrl().replace(/\/+$/, '');
  const url = `${baseUrl}/admin/group-bookings/${encodeURIComponent(id)}/document`;
  const token = await getToken();
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: '*/*',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const contentType = res.headers.get('content-type') || '';
  const contentDisposition = res.headers.get('content-disposition') || '';

  if (!res.ok) {
    let message = `Download failed (${res.status})`;
    try {
      const ct = (contentType || '').toLowerCase();
      if (ct.includes('application/json')) {
        const j = await res.json();
        if (j?.message) message = String(j.message);
      } else {
        const t = await res.text();
        const trimmed = t.trim();
        if (trimmed) {
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed?.message) message = String(parsed.message);
            else message = trimmed.slice(0, 240);
          } catch {
            message = trimmed.slice(0, 240);
          }
        }
      }
    } catch {
      /* keep default */
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  const arrayBuffer = await res.arrayBuffer();
  // React Native's Blob cannot be constructed from ArrayBuffer (browser-only); only build for web.
  let blob = null;
  if (
    Platform.OS === 'web' &&
    typeof Blob !== 'undefined' &&
    typeof window !== 'undefined' &&
    window.URL?.createObjectURL
  ) {
    const mime = contentType.split(';')[0].trim() || 'application/octet-stream';
    try {
      blob = new Blob([arrayBuffer], { type: mime });
    } catch {
      blob = null;
    }
  }
  return {
    arrayBuffer,
    blob,
    contentType,
    contentDisposition,
  };
}
