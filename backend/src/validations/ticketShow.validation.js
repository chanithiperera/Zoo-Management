const { body, param } = require('express-validator');

const bookingItemRule = (field) =>
  body(field)
    .optional()
    .isArray()
    .withMessage(`${field} must be an array`)
    .bail()
    .custom((items) => {
      if (!Array.isArray(items)) return false;
      return items.every((item) => (
        item
        && typeof item === 'object'
        && typeof item.itemCode === 'string'
        && item.itemCode.trim().length > 0
        && Number.isInteger(item.quantity)
        && item.quantity >= 0
      ));
    })
    .withMessage(`${field} items must contain itemCode and quantity >= 0`);

const createBookingRules = [
  body('visitDate')
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('visitDate must be a valid ISO date (YYYY-MM-DD)'),
  bookingItemRule('entryItems'),
  bookingItemRule('showItems'),
  body('payment.cardholderName')
    .trim()
    .notEmpty()
    .withMessage('Payment cardholderName is required'),
  body('payment.cardNumber')
    .matches(/^\d{16}$/)
    .withMessage('Payment cardNumber must be 16 digits'),
  body('payment.expiryDate')
    .matches(/^\d{2}\/\d{2}$/)
    .withMessage('Payment expiryDate must be MM/YY'),
  body('payment.cvv')
    .matches(/^\d{3,4}$/)
    .withMessage('Payment cvv must be 3 or 4 digits'),
];

const bookingIdParamRules = [
  param('id').isMongoId().withMessage('Booking id must be a valid Mongo id'),
];

const verifyEntryRules = [
  body('bookingId').isMongoId().withMessage('bookingId must be a valid Mongo id'),
  body('confirmationCode')
    .trim()
    .notEmpty()
    .withMessage('confirmationCode is required'),
];

module.exports = { createBookingRules, bookingIdParamRules, verifyEntryRules };
