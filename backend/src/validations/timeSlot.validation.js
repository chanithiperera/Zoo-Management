const { body, param } = require('express-validator');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const timeSlotIdRule = [param('id').matches(objectIdPattern).withMessage('Invalid time slot ID')];

const createTimeSlotRules = [
  // Date is required
  body('date').notEmpty().withMessage('Date is required'),
  
  // Time format checks
  body('startTime').matches(timePattern).withMessage('startTime must be in HH:mm format'),
  body('endTime').matches(timePattern).withMessage('endTime must be in HH:mm format'),
  
  // Photographer is only required if type is Photography
  body('photographer')
    .if(body('type').equals('Photography'))
    .matches(objectIdPattern)
    .withMessage('Valid photographer ID is required for photography slots'),
  
  // New fields
  body('type').optional().isIn(['Photography', 'Feeding']).withMessage('Invalid slot type'),
  body('animalName').optional().isString().withMessage('Animal name must be a string'),
  
  // Capacity check
  body('capacity').isInt({ min: 1, max: 500 }).withMessage('capacity must be between 1 and 500'),
];

const updateTimeSlotRules = [
  ...timeSlotIdRule,
  body('date').optional().notEmpty().withMessage('Date cannot be empty'),
  body('startTime').optional().matches(timePattern).withMessage('startTime must be in HH:mm format'),
  body('endTime').optional().matches(timePattern).withMessage('endTime must be in HH:mm format'),
  body('photographer').optional().matches(objectIdPattern).withMessage('Invalid photographer ID'),
  body('capacity').optional().isInt({ min: 1, max: 500 }).withMessage('capacity must be between 1 and 500'),
  body('isBooked').optional().isBoolean().withMessage('isBooked must be boolean'),
  body('type').optional().isIn(['Photography', 'Feeding']).withMessage('Invalid slot type'),
  body('animalName').optional().isString().withMessage('Animal name must be a string'),
];

module.exports = {
  timeSlotIdRule,
  createTimeSlotRules,
  updateTimeSlotRules,
};
