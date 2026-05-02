const express = require('express');
const photographyBookingController = require('../controllers/photographyBooking.controller');
const { requireDatabase } = require('../middleware/db.middleware');
const validate = require('../middleware/validation.middleware');
const {
  bookingIdRule,
  createBookingRules,
  updateBookingRules,
} = require('../validations/photographyBooking.validation');

const router = express.Router();

router
  .route('/')
  .post(requireDatabase, createBookingRules, validate, photographyBookingController.createBooking)
  .get(requireDatabase, photographyBookingController.getAllBookings);

router
  .route('/:id')
  .get(requireDatabase, bookingIdRule, validate, photographyBookingController.getBookingById)
  .patch(requireDatabase, updateBookingRules, validate, photographyBookingController.updateBooking)
  .delete(requireDatabase, bookingIdRule, validate, photographyBookingController.deleteBooking);

module.exports = router;
