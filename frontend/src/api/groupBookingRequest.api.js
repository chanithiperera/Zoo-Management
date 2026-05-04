import apiClient from './client';

/**
 * Submit a group booking request with the supporting letter.
 * @param {object} payload
 * @param {object} payload.fields - All non-file fields keyed by name (groupType, organizationName, etc.).
 * @param {{ uri: string, name: string, mimeType: string, file?: File }} payload.document - Supporting document descriptor.
 */
export async function submitGroupRequest({ fields, document }) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, String(value));
  });

  // Supporting document is optional.
  if (document?.file) {
    // Web requires a real File/Blob.
    formData.append('supportingDocument', document.file, document.name);
  } else if (document?.uri) {
    // Native uses { uri, name, type }.
    formData.append('supportingDocument', {
      uri: document.uri,
      name: document.name,
      type: document.mimeType,
    });
  }

  const res = await apiClient.post('/ticket-show/group-requests', formData);
  return res.data;
}

export async function getMyGroupRequests() {
  const res = await apiClient.get('/ticket-show/group-requests/me');
  return res.data;
}

export async function getGroupRequest(id) {
  const res = await apiClient.get(`/ticket-show/group-requests/${id}`);
  return res.data;
}
