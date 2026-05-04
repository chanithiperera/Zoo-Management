import client from "./client";

// ─── Events ───────────────────────────────────────────────────────────────────

export const getAllEvents = (params = {}) =>
  client.get("/events", { params });

export const getEventById = (id) =>
  client.get(`/events/${id}`);

// FormData: omit Content-Type so the RN/axios adapter adds the multipart boundary.
const multipartConfig = {
  transformRequest: (data, headers) => {
    // In React Native, `instanceof FormData` can be unreliable depending on the runtime.
    // Detect "FormData-like" objects by checking for `.append`.
    const isFormDataLike = !!data && typeof data.append === "function";
    if (isFormDataLike) {
      // Axios v1 may provide AxiosHeaders; prefer its API.
      if (headers && typeof headers.delete === "function") {
        headers.delete("Content-Type");
      } else if (headers) {
        delete headers["Content-Type"];
      }
    }
    return data;
  },
};

export const createEvent = (formData) =>
  client.post("/events", formData, multipartConfig);

export const updateEvent = (id, formData) =>
  client.put(`/events/${id}`, formData, multipartConfig);

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