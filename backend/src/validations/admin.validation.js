const { body, param, query } = require('express-validator');

const userIdParamRule = [param('id').isMongoId().withMessage('Valid user id is required')];

const updateUserRules = [
  ...userIdParamRule,
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .custom((value) => !/\d/.test(value))
    .withMessage('Name must not contain numbers'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .custom((value) => {
      const digits = String(value).replace(/\D/g, '');
      return digits.length > 0 && digits.length <= 10;
    })
    .withMessage('Phone must contain 1–10 digits'),
  body('role').isIn(['admin', 'visitor']).withMessage('Role must be admin or visitor'),
];

const createUserRules = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .custom((value) => !/\d/.test(value))
    .withMessage('Name must not contain numbers'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .custom((value) => {
      const digits = String(value).replace(/\D/g, '');
      return digits.length > 0 && digits.length <= 10;
    })
    .withMessage('Phone must contain 1–10 digits'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'visitor']).withMessage('Role must be admin or visitor'),
];

const deleteUserRules = [...userIdParamRule];

const catalogIdParamRule = [param('id').isMongoId().withMessage('Valid catalog id is required')];

const updateEntryCatalogRules = [
  ...catalogIdParamRule,
  body('name').trim().notEmpty().withMessage('Entry ticket name is required'),
  body('priceLkr')
    .isInt({ min: 1 })
    .withMessage('Entry ticket priceLkr must be a positive integer'),
];

const updateShowCatalogRules = [
  ...catalogIdParamRule,
  body('name').trim().notEmpty().withMessage('Show name is required'),
  body('priceLkr')
    .isInt({ min: 1 })
    .withMessage('Show priceLkr must be a positive integer'),
  body('timeLabel').trim().notEmpty().withMessage('Show timeLabel is required'),
  body('imageUrl')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Show imageUrl must be a string'),
  body('dailyCapacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Show dailyCapacity must be a positive integer'),
];

const createShowCatalogRules = [
  body('name').trim().notEmpty().withMessage('Show name is required'),
  body('priceLkr')
    .isInt({ min: 1 })
    .withMessage('Show priceLkr must be a positive integer'),
  body('timeLabel').trim().notEmpty().withMessage('Show timeLabel is required'),
  body('imageUrl')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Show imageUrl must be a string'),
  body('dailyCapacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Show dailyCapacity must be a positive integer'),
];

const deleteCatalogItemRules = [...catalogIdParamRule];

const listAdminBookingsRules = [
  query('visitDate')
    .optional()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('visitDate must be a valid ISO date (YYYY-MM-DD)'),
];

const listAdminGroupBookingsRules = [
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'completed'])
    .withMessage('status must be pending, approved, rejected, or completed'),
];

const adminGroupBookingIdParamRules = [
  param('id').isMongoId().withMessage('Group booking id must be a valid Mongo id'),
];

const checkInBookingRules = [
  body('code')
    .isString()
    .withMessage('code must be a string')
    .bail()
    .trim()
    .isLength({ min: 4, max: 512 })
    .withMessage('code must be between 4 and 512 characters'),
];

const updateAdminGroupBookingStatusRules = [
  ...adminGroupBookingIdParamRules,
  body('status')
    .isIn(['approved', 'rejected', 'completed'])
    .withMessage('status must be approved, rejected, or completed'),
  body('reviewNotes')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('reviewNotes must be a string')
    .isLength({ max: 2000 })
    .withMessage('reviewNotes must be at most 2000 characters'),
];

module.exports = {
  createUserRules,
  updateUserRules,
  deleteUserRules,
  updateEntryCatalogRules,
  updateShowCatalogRules,
  createShowCatalogRules,
  deleteCatalogItemRules,
  listAdminBookingsRules,
  listAdminGroupBookingsRules,
  adminGroupBookingIdParamRules,
  updateAdminGroupBookingStatusRules,
  checkInBookingRules,
};
