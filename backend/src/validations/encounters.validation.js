const { body, param } = require('express-validator');

const encounterFields = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be at most 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 10000 })
    .withMessage('Description must be at most 10000 characters'),
  body('duration')
    .isInt({ min: 1, max: 1440 })
    .withMessage('Duration must be 1–1440 minutes'),
  body('maxParticipants')
    .isInt({ min: 1, max: 500 })
    .withMessage('maxParticipants must be 1–500'),
  body('price').isFloat({ min: 0, max: 1e8 }).withMessage('Price must be a non-negative number'),
  body('animal')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid animal id'),
  body('animalName').optional().isString().isLength({ max: 200 }).withMessage('animalName is too long'),
  body('photographyIncluded').optional().isBoolean().withMessage('photographyIncluded must be boolean'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

exports.createEncounterRules = encounterFields;

exports.updateEncounterRules = [
  param('id').isMongoId().withMessage('Invalid encounter id'),
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().trim().notEmpty().isLength({ max: 10000 }),
  body('duration').optional().isInt({ min: 1, max: 1440 }),
  body('maxParticipants').optional().isInt({ min: 1, max: 500 }),
  body('price').optional().isFloat({ min: 0, max: 1e8 }),
  body('animal').optional({ nullable: true, checkFalsy: true }).isMongoId(),
  body('animalName').optional().isString().isLength({ max: 200 }),
  body('photographyIncluded').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
];

exports.deleteEncounterRules = [param('id').isMongoId().withMessage('Invalid encounter id')];

exports.getEncounterByIdRules = [param('id').isMongoId().withMessage('Invalid encounter id')];
