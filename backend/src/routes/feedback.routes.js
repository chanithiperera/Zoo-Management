const express = require('express');
const feedbackController = require('../controllers/feedback.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { createUpload } = require('../middleware/upload.middleware');
const { requireDatabase } = require('../middleware/db.middleware');
const validateRequest = require('../validations/validateRequest');
const {
  createFeedbackRules,
  updateFeedbackRules,
  deleteFeedbackRules,
  createInquiryRules,
  updateInquiryRules,
  deleteInquiryRules,
  createReviewRules,
  updateReviewRules,
  deleteReviewRules,
  adminReplyRules,
} = require('../validations/feedback.validation');

const router = express.Router();

const inquiryUpload = createUpload('feedback', {
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.use(requireDatabase, protect);

/* Specific paths before generic `/:id` so e.g. `/inquiries/...` is not captured as feedback id. */

router.post('/', createFeedbackRules, validateRequest, feedbackController.createFeedback);
router.get('/user', feedbackController.getMyFeedbacks);
router.get('/all', restrictTo('admin'), feedbackController.getAllFeedbacks);

router.post('/inquiries', inquiryUpload.single('image'), createInquiryRules, validateRequest, feedbackController.createInquiry);
router.get('/inquiries/user', feedbackController.getMyInquiries);
router.get('/inquiries/all', restrictTo('admin'), feedbackController.getAllInquiries);
router.patch('/inquiries/:id', inquiryUpload.single('image'), updateInquiryRules, validateRequest, feedbackController.updateInquiry);
router.delete('/inquiries/:id', deleteInquiryRules, validateRequest, feedbackController.deleteInquiry);

router.post('/reviews', createReviewRules, validateRequest, feedbackController.createReview);
router.get('/reviews/user', feedbackController.getMyReviews);
router.get('/reviews/all', restrictTo('admin'), feedbackController.getAllReviews);
router.patch('/reviews/:id', updateReviewRules, validateRequest, feedbackController.updateReview);
router.delete('/reviews/:id', deleteReviewRules, validateRequest, feedbackController.deleteReview);

router.post('/inquiries/:id/reply', restrictTo('admin'), adminReplyRules, validateRequest, feedbackController.replyToInquiry);
router.post('/reviews/:id/reply', restrictTo('admin'), adminReplyRules, validateRequest, feedbackController.replyToReview);

router.patch('/:id', updateFeedbackRules, validateRequest, feedbackController.updateFeedback);
router.delete('/:id', deleteFeedbackRules, validateRequest, feedbackController.deleteFeedback);
router.post('/:id/reply', restrictTo('admin'), adminReplyRules, validateRequest, feedbackController.replyToFeedback);

module.exports = router;
