const { body, param } = require('express-validator');

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
];

const createShowCatalogRules = [
  body('name').trim().notEmpty().withMessage('Show name is required'),
  body('priceLkr')
    .isInt({ min: 1 })
    .withMessage('Show priceLkr must be a positive integer'),
  body('timeLabel').trim().notEmpty().withMessage('Show timeLabel is required'),
];

const deleteCatalogItemRules = [...catalogIdParamRule];

module.exports = {
  createUserRules,
  updateUserRules,
  deleteUserRules,
  updateEntryCatalogRules,
  updateShowCatalogRules,
  createShowCatalogRules,
  deleteCatalogItemRules,
};
