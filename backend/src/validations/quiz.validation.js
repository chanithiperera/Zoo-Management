const { body, param } = require('express-validator');

const optionsRule = body('options')
  .isArray({ min: 2, max: 6 })
  .withMessage('Options must be an array of 2–6 items')
  .bail()
  .custom((options) => {
    if (!Array.isArray(options)) return false;
    return options.every((o) => o && typeof o === 'object' && String(o.text || '').trim().length > 0);
  })
  .withMessage('Each option must have non-empty text');

const optionTextLengths = body('options.*.text')
  .trim()
  .notEmpty()
  .withMessage('Option text is required')
  .isLength({ max: 500 })
  .withMessage('Each option must be at most 500 characters');

const correctIndexRule = body('correctAnswerIndex')
  .isInt({ min: 0 })
  .withMessage('correctAnswerIndex must be a non-negative integer')
  .custom((value, { req }) => {
    const opts = req.body?.options;
    if (!Array.isArray(opts)) return false;
    return value < opts.length;
  })
  .withMessage('correctAnswerIndex must refer to a valid option');

const createQuizRules = [
  body('animal').isMongoId().withMessage('Valid animal id is required'),
  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question is required')
    .isLength({ min: 2, max: 2000 })
    .withMessage('Question must be 2–2000 characters'),
  optionsRule,
  optionTextLengths,
  correctIndexRule,
  body('explanation')
    .optional()
    .isString()
    .withMessage('Explanation must be text')
    .bail()
    .isLength({ max: 5000 })
    .withMessage('Explanation must be at most 5000 characters'),
];

exports.createQuizRules = createQuizRules;

/** Admin updates send a full quiz payload (same shape as create). */
exports.updateQuizRules = [param('id').isMongoId().withMessage('Invalid quiz id'), ...createQuizRules];

exports.deleteQuizRules = [param('id').isMongoId().withMessage('Invalid quiz id')];
