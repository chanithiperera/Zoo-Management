const { body } = require('express-validator');

const registerRules = [
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
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileRules = [
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
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];

module.exports = { registerRules, loginRules, updateProfileRules, changePasswordRules };
