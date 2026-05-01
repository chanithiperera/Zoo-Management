const { body, param } = require('express-validator');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const bookingIdRule = [param('id').matches(objectIdPattern).withMessage('Invalid booking ID')];

const createBookingRules = [
  body('visitorName').trim().notEmpty().withMessage('visitorName is required'),
  body('contactInfo').trim().notEmpty().withMessage('contactInfo is required'),
  body('animal').matches(objectIdPattern).withMessage('Valid animal ID is required'),
  body('package').optional().matches(objectIdPattern).withMessage('Invalid package ID'),
  body('photographer').matches(objectIdPattern).withMessage('Valid photographer ID is required'),
  body('timeSlot').matches(objectIdPattern).withMessage('Valid timeSlot ID is required'),
  body('duration').isInt({ min: 15, max: 1440 }).withMessage('duration must be between 15 and 1440'),
];

const updateBookingRules = [
  ...bookingIdRule,
  body('animal').optional().matches(objectIdPattern).withMessage('Invalid animal ID'),
  body('package').optional().matches(objectIdPattern).withMessage('Invalid package ID'),
  body('photographer').optional().matches(objectIdPattern).withMessage('Invalid photographer ID'),
  body('timeSlot').optional().matches(objectIdPattern).withMessage('Invalid timeSlot ID'),
  body('duration').optional().isInt({ min: 15, max: 1440 }).withMessage('duration must be between 15 and 1440'),
  body('status').optional().isIn(['booked', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('time').optional().matches(timePattern).withMessage('time must be in HH:mm format'),
];

module.exports = {
  bookingIdRule,
  createBookingRules,
  updateBookingRules,
};
