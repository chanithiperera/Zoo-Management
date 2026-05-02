const express = require("express");
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  bookEvent,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
} = require("../controllers/events.controller");

const { protect, restrictTo } = require("../middleware/auth.middleware");
const { createUpload } = require("../middleware/upload.middleware");

const upload = createUpload("events");

// ─── Public Event Routes ───────────────────────────────────────────────────────
router.get("/", getAllEvents);

// ─── Booking Routes (MUST be before /:id to avoid route conflict) ─────────────
router.get("/bookings/my",                  protect, getMyBookings);
router.get("/bookings/all",                 protect, restrictTo("admin"), getAllBookings);
router.patch("/bookings/:bookingId/cancel", protect, cancelBooking);
router.patch("/bookings/:bookingId/status", protect, restrictTo("admin"), updateBookingStatus);

// ─── Single Event Route (/:id must be AFTER /bookings routes) ─────────────────
router.get("/:id", getEventById);

// ─── Admin Event Routes ────────────────────────────────────────────────────────
router.post("/",      protect, restrictTo("admin"), upload.single("image"), createEvent);
router.put("/:id",    protect, restrictTo("admin"), upload.single("image"), updateEvent);
router.delete("/:id", protect, restrictTo("admin"), deleteEvent);

// ─── Book an Event ─────────────────────────────────────────────────────────────
router.post("/:id/book", protect, bookEvent);

module.exports = router;
