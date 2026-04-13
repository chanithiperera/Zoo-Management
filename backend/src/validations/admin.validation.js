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

const deleteUserRules = [...userIdParamRule];

module.exports = { updateUserRules, deleteUserRules };
