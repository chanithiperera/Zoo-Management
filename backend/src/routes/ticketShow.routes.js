const express = require('express');
const ticketShowController = require('../controllers/ticketShow.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');
const validateRequest = require('../validations/validateRequest');
const { createBookingRules, bookingIdParamRules } = require('../validations/ticketShow.validation');

const router = express.Router();

router.get('/', ticketShowController.getModuleInfo);
router.get('/catalog', requireDatabase, ticketShowController.getCatalog);
router.post(
  '/bookings',
  requireDatabase,
  protect,
  createBookingRules,
  validateRequest,
  ticketShowController.createBooking
);
router.get('/bookings/me', requireDatabase, protect, ticketShowController.getMyBookings);
router.get(
  '/bookings/:id',
  requireDatabase,
  protect,
  bookingIdParamRules,
  validateRequest,
  ticketShowController.getBookingById
);

module.exports = router;
