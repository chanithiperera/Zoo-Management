const asyncHandler = require('../utils/asyncHandler');
const timeSlotService = require('../services/timeSlot.service');

exports.createTimeSlot = asyncHandler(async (req, res) => {
  const populatedTimeSlot = await timeSlotService.createTimeSlot(req.body);

  res.status(201).json({
    success: true,
    message: 'Time slot created successfully',
    data: populatedTimeSlot,
  });
});

exports.getAllTimeSlots = asyncHandler(async (req, res) => {
  const timeSlots = await timeSlotService.getAllTimeSlots();

  res.status(200).json({
    success: true,
    count: timeSlots.length,
    data: timeSlots,
  });
});

exports.getTimeSlotById = asyncHandler(async (req, res) => {
  const timeSlot = await timeSlotService.getTimeSlotById(req.params.id);

  res.status(200).json({
    success: true,
    data: timeSlot,
  });
});

exports.updateTimeSlot = asyncHandler(async (req, res) => {
  const updatedTimeSlot = await timeSlotService.updateTimeSlot(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Time slot updated successfully',
    data: updatedTimeSlot,
  });
});

exports.deleteTimeSlot = asyncHandler(async (req, res) => {
  console.log('--- BACKEND DELETE RECEIVED ---');
  console.log('ID Params:', req.params.id);
  
  await timeSlotService.deleteTimeSlot(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Time slot deleted successfully',
  });
});
