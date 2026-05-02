const express = require('express');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/events.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');

const router = express.Router();

router.use(requireDatabase);

router
  .route('/')
  .get(getAllEvents)
  .post(protect, restrictTo('admin'), createEvent);

router
  .route('/:id')
  .get(getEventById)
  .put(protect, restrictTo('admin'), updateEvent)
  .delete(protect, restrictTo('admin'), deleteEvent);

module.exports = router;
