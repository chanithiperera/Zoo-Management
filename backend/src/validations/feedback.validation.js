const { body, param } = require('express-validator');

/** Aligned with visitor feedback / inquiry screens. */
const FEEDBACK_TYPES = [
  'Entry Tickets and Show Booking',
  'Event Booking',
  'Animal Encounter and Photography',
  'Animal Information and Education',
  'Online Store',
  'General',
];

const typeRule = body('type')
  .trim()
  .notEmpty()
  .withMessage('Type is required')
  .isIn(FEEDBACK_TYPES)
  .withMessage('Invalid category');

const subjectRule = body('subject')
  .trim()
  .notEmpty()
  .withMessage('Subject is required')
  .isLength({ min: 3, max: 200 })
  .withMessage('Subject must be 3–200 characters');

const messageRule = body('message')
  .trim()
  .notEmpty()
  .withMessage('Message is required')
  .isLength({ min: 10, max: 8000 })
  .withMessage('Message must be 10–8000 characters');

exports.createFeedbackRules = [typeRule, subjectRule, messageRule];

exports.updateFeedbackRules = [
  param('id').isMongoId().withMessage('Invalid feedback id'),
  body('type').optional().trim().isIn(FEEDBACK_TYPES).withMessage('Invalid category'),
  body('subject').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Subject must be 3–200 characters'),
  body('message').optional().trim().isLength({ min: 10, max: 8000 }).withMessage('Message must be 10–8000 characters'),
];

exports.deleteFeedbackRules = [param('id').isMongoId().withMessage('Invalid feedback id')];

exports.createInquiryRules = [typeRule, subjectRule, messageRule];

exports.updateInquiryRules = [
  param('id').isMongoId().withMessage('Invalid inquiry id'),
  body('type').optional().trim().isIn(FEEDBACK_TYPES).withMessage('Invalid category'),
  body('subject').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Subject must be 3–200 characters'),
  body('message').optional().trim().isLength({ min: 10, max: 8000 }).withMessage('Message must be 10–8000 characters'),
];

exports.deleteInquiryRules = [param('id').isMongoId().withMessage('Invalid inquiry id')];

exports.createReviewRules = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer from 1 to 5'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 8000 })
    .withMessage('Review must be 10–8000 characters'),
];

exports.updateReviewRules = [
  param('id').isMongoId().withMessage('Invalid review id'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer from 1 to 5'),
  body('message').optional().trim().isLength({ min: 10, max: 8000 }).withMessage('Review must be 10–8000 characters'),
];

exports.deleteReviewRules = [param('id').isMongoId().withMessage('Invalid review id')];

exports.adminReplyRules = [
  param('id').isMongoId().withMessage('Invalid id'),
  body('reply')
    .optional()
    .isString()
    .withMessage('Reply must be text')
    .bail()
    .isLength({ max: 8000 })
    .withMessage('Reply must be at most 8000 characters'),
];
