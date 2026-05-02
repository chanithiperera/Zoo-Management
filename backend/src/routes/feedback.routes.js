const express = require('express');
const {
  getAllFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} = require('../controllers/feedback.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');

const router = express.Router();

router.use(requireDatabase);

// Public: visitors submit feedback
router.route('/').get(protect, restrictTo('admin'), getAllFeedback).post(createFeedback);

// Admin: view single, update status, or delete
router.route('/:id').get(protect, restrictTo('admin'), getFeedbackById).delete(protect, restrictTo('admin'), deleteFeedback);
router.patch('/:id/status', protect, restrictTo('admin'), updateFeedbackStatus);

module.exports = router;
