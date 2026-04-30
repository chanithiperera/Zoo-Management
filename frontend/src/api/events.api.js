import client from "./client";

// ─── Events ───────────────────────────────────────────────────────────────────

export const getAllEvents = (params = {}) =>
  client.get("/events", { params });

export const getEventById = (id) =>
  client.get(`/events/${id}`);

export const createEvent = (formData) =>
  client.post("/events", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateEvent = (id, formData) =>
  client.put(`/events/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteEvent = (id) =>
  client.delete(`/events/${id}`);

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookEvent = (eventId, data) =>
  client.post(`/events/${eventId}/book`, data);

export const getMyBookings = () =>
  client.get("/events/bookings/my");

export const cancelBooking = (bookingId) =>
  client.patch(`/events/bookings/${bookingId}/cancel`);

export const getAllBookings = (params = {}) =>
  client.get("/events/bookings/all", { params });

export const updateBookingStatus = (bookingId, status) =>
  client.patch(`/events/bookings/${bookingId}/status`, { status });