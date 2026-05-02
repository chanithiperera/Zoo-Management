const express = require('express');
const feedingBookingController = require('../controllers/feedingBooking.controller');
const { requireDatabase } = require('../middleware/db.middleware');

const router = express.Router();

router
  .route('/')
  .post(requireDatabase, feedingBookingController.createBooking)
  .get(requireDatabase, feedingBookingController.getAllBookings);

router
  .route('/:id')
  .patch(requireDatabase, feedingBookingController.updateBooking)
  .delete(requireDatabase, feedingBookingController.deleteBooking);

module.exports = router;
