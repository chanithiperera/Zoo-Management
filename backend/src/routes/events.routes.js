const express = require('express');
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
} = require('../controllers/events.controller');

const { protect, restrictTo } = require('../middleware/auth.middleware');
const { createUpload } = require('../middleware/upload.middleware');

const router = express.Router();

const upload = createUpload('events');

router.get('/', getAllEvents);

router.get('/bookings/my', protect, getMyBookings);
router.get('/bookings/all', protect, restrictTo('admin'), getAllBookings);
router.patch('/bookings/:bookingId/cancel', protect, cancelBooking);
router.patch('/bookings/:bookingId/status', protect, restrictTo('admin'), updateBookingStatus);

router.get('/:id', getEventById);

// `fields` is more forgiving with RN/Expo FormData multipart than `single` alone.
const eventImageUpload = upload.fields([{ name: 'image', maxCount: 1 }]);
router.post('/', protect, restrictTo('admin'), eventImageUpload, createEvent);
router.put('/:id', protect, restrictTo('admin'), eventImageUpload, updateEvent);
router.delete('/:id', protect, restrictTo('admin'), deleteEvent);

router.post('/:id/book', protect, bookEvent);

module.exports = router;
