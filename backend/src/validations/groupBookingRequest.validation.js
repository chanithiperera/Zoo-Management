const { body, param } = require('express-validator');

const MIN_GROUP_BOOKING_DAYS_AHEAD = 3;

const createGroupRequestRules = [
  body('groupType')
    .isIn(['school', 'tourist', 'other'])
    .withMessage('groupType must be one of school, tourist, other'),
  body('organizationName')
    .trim()
    .notEmpty()
    .withMessage('organizationName is required')
    .isLength({ max: 200 })
    .withMessage('organizationName must be at most 200 characters'),
  body('contactName')
    .trim()
    .notEmpty()
    .withMessage('contactName is required')
    .isLength({ max: 120 })
    .withMessage('contactName must be at most 120 characters'),
  body('contactPhone')
    .trim()
    .notEmpty()
    .withMessage('contactPhone is required')
    .matches(/^[+\d][\d\s\-()]{6,19}$/)
    .withMessage('contactPhone must be a valid phone number'),
  body('contactEmail')
    .trim()
    .isEmail()
    .withMessage('contactEmail must be a valid email')
    .normalizeEmail(),
  body('visitDate')
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('visitDate must be a valid ISO date (YYYY-MM-DD)')
    .bail()
    .custom((value) => {
      const [yearStr, monthStr, dayStr] = String(value).split('-');
      const visitDate = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
      visitDate.setHours(0, 0, 0, 0);

      const minAllowed = new Date();
      minAllowed.setHours(0, 0, 0, 0);
      minAllowed.setDate(minAllowed.getDate() + MIN_GROUP_BOOKING_DAYS_AHEAD);

      if (visitDate.getTime() < minAllowed.getTime()) {
        throw new Error(`visitDate must be at least ${MIN_GROUP_BOOKING_DAYS_AHEAD} days from today`);
      }
      return true;
    }),
  body('totalPeople')
    .toInt()
    .isInt({ min: 20 })
    .withMessage('totalPeople must be at least 20'),
  body('adultsCount')
    .toInt()
    .isInt({ min: 0 })
    .withMessage('adultsCount must be a non-negative integer'),
  body('childrenCount')
    .toInt()
    .isInt({ min: 0 })
    .withMessage('childrenCount must be a non-negative integer'),
  body().custom((_, { req }) => {
    const total = Number(req.body.totalPeople);
    const adults = Number(req.body.adultsCount);
    const children = Number(req.body.childrenCount);
    if (Number.isFinite(total) && Number.isFinite(adults) && Number.isFinite(children)) {
      if (adults + children !== total) {
        throw new Error('adultsCount + childrenCount must equal totalPeople');
      }
    }
    return true;
  }),
  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ max: 2000 })
    .withMessage('notes must be at most 2000 characters'),
];

const groupRequestIdParamRules = [
  param('id').isMongoId().withMessage('Group request id must be a valid Mongo id'),
];

module.exports = { createGroupRequestRules, groupRequestIdParamRules };
