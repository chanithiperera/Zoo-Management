const express = require('express');
const timeSlotController = require('../controllers/timeSlot.controller');
const { requireDatabase } = require('../middleware/db.middleware');
const validate = require('../middleware/validation.middleware');
const {
  timeSlotIdRule,
  createTimeSlotRules,
  updateTimeSlotRules,
} = require('../validations/timeSlot.validation');

const router = express.Router();

router
  .route('/')
  .post(requireDatabase, createTimeSlotRules, validate, timeSlotController.createTimeSlot)
  .get(requireDatabase, timeSlotController.getAllTimeSlots);

router
  .route('/:id')
  .get(requireDatabase, timeSlotIdRule, validate, timeSlotController.getTimeSlotById)
  .patch(requireDatabase, updateTimeSlotRules, validate, timeSlotController.updateTimeSlot)
  .delete(requireDatabase, timeSlotIdRule, validate, timeSlotController.deleteTimeSlot)
  .post(requireDatabase, timeSlotIdRule, validate, timeSlotController.deleteTimeSlot); // ADDED POST AS FALLBACK

module.exports = router;
