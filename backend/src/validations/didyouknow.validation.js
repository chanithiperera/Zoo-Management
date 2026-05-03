const { body, param } = require('express-validator');

exports.createDidYouKnowRules = [
  body('animal').isMongoId().withMessage('Valid animal id is required'),
  body('fact')
    .trim()
    .notEmpty()
    .withMessage('Fact is required')
    .isLength({ min: 5, max: 2000 })
    .withMessage('Fact must be 5–2000 characters'),
  body('source').optional().trim().isLength({ max: 300 }).withMessage('Source is too long'),
];

exports.updateDidYouKnowRules = [
  param('id').isMongoId().withMessage('Invalid id'),
  body('animal').optional().isMongoId().withMessage('Valid animal id is required'),
  body('fact').optional().trim().notEmpty().isLength({ min: 5, max: 2000 }).withMessage('Fact must be 5–2000 characters'),
  body('source').optional().trim().isLength({ max: 300 }),
];

exports.deleteDidYouKnowRules = [param('id').isMongoId().withMessage('Invalid id')];
