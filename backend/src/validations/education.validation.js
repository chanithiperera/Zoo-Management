const { body, param } = require('express-validator');

const EDU_TYPES = ['article', 'video', 'activity', 'game', 'quiz'];

exports.createEducationRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 300 })
    .withMessage('Title must be at most 300 characters'),
  body('type').trim().notEmpty().isIn(EDU_TYPES).withMessage('Invalid education type'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 50000 })
    .withMessage('Content must be at most 50000 characters'),
  body('imageUrl')
    .trim()
    .notEmpty()
    .withMessage('imageUrl is required')
    .isLength({ max: 2000 })
    .withMessage('imageUrl is too long'),
  body('animal').isMongoId().withMessage('Valid animal id is required'),
];

exports.updateEducationRules = [
  param('id').isMongoId().withMessage('Invalid education id'),
  body('title').optional().trim().notEmpty().isLength({ max: 300 }).withMessage('Title must be 1–300 characters'),
  body('type').optional().trim().isIn(EDU_TYPES).withMessage('Invalid education type'),
  body('content').optional().trim().notEmpty().isLength({ max: 50000 }).withMessage('Invalid content'),
  body('imageUrl').optional().trim().notEmpty().isLength({ max: 2000 }).withMessage('imageUrl is too long'),
  body('animal').optional().isMongoId().withMessage('Valid animal id is required'),
];

exports.deleteEducationRules = [param('id').isMongoId().withMessage('Invalid education id')];
