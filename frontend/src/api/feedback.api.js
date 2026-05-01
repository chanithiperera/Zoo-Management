import apiClient from './client';

// Feedback
export async function createFeedback(payload) {
  const res = await apiClient.post('/feedback', payload);
  return res.data;
}

export async function getMyFeedbacks() {
  const res = await apiClient.get('/feedback/user');
  return res.data;
}

export async function getAllFeedbacks() {
  const res = await apiClient.get('/feedback/all');
  return res.data;
}

// Inquiries
export async function createInquiry(formData) {
  const res = await apiClient.post('/feedback/inquiries', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function getMyInquiries() {
  const res = await apiClient.get('/feedback/inquiries/user');
  return res.data;
}

export async function getAllInquiries() {
  const res = await apiClient.get('/feedback/inquiries/all');
  return res.data;
}

// Reviews
export async function createReview(payload) {
  const res = await apiClient.post('/feedback/reviews', payload);
  return res.data;
}

export async function getMyReviews() {
  const res = await apiClient.get('/feedback/reviews/user');
  return res.data;
}

export async function getAllReviews() {
  const res = await apiClient.get('/feedback/reviews/all');
  return res.data;
}

// Update & Delete
export async function updateFeedback(id, payload) {
  const res = await apiClient.patch(`/feedback/${id}`, payload);
  return res.data;
}

export async function deleteFeedback(id) {
  const res = await apiClient.delete(`/feedback/${id}`);
  return res.data;
}

export async function updateInquiry(id, formData) {
  const res = await apiClient.patch(`/feedback/inquiries/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function deleteInquiry(id) {
  const res = await apiClient.delete(`/feedback/inquiries/${id}`);
  return res.data;
}

export async function updateReview(id, payload) {
  const res = await apiClient.patch(`/feedback/reviews/${id}`, payload);
  return res.data;
}

export async function deleteReview(id) {
  const res = await apiClient.delete(`/feedback/reviews/${id}`);
  return res.data;
}

// Admin Replies
export async function replyToFeedback(id, reply) {
  const res = await apiClient.post(`/feedback/${id}/reply`, { reply });
  return res.data;
}

export async function replyToInquiry(id, reply) {
  const res = await apiClient.post(`/feedback/inquiries/${id}/reply`, { reply });
  return res.data;
}

export async function replyToReview(id, reply) {
  const res = await apiClient.post(`/feedback/reviews/${id}/reply`, { reply });
  return res.data;
}
