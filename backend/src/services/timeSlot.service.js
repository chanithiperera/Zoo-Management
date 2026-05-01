const mongoose = require('mongoose');
const TimeSlot = require('../models/TimeSlot.model');
const AppError = require('../utils/AppError');

const populatePhotographer = { path: 'photographer', select: 'name specialty isActive' };

const createTimeSlot = async (payload) => {
  try {
    // Basic server-side validation
    if (payload.type === 'Photography' && (!payload.photographer || payload.photographer === '')) {
      throw new AppError('Photographer selection is required for photography slots.', 400);
    }

    // Create slot with provided payload
    const slot = await TimeSlot.create(payload);
    
    // Only return populated if we have a photographer
    if (slot.photographer) {
      const populated = await TimeSlot.findById(slot._id).populate(populatePhotographer);
      return populated;
    }
    
    return slot;
  } catch (error) {
    console.error('TimeSlot Service Error:', error);
    
    if (error instanceof AppError) throw error;
    
    if (error.name === 'ValidationError') {
      const msgs = Object.values(error.errors).map(e => e.message);
      throw new AppError(`Form Validation: ${msgs.join(', ')}`, 400);
    }
    
    throw new AppError(error.message || 'Error creating time slot', 400);
  }
};

const getAllTimeSlots = () => TimeSlot.find().populate(populatePhotographer).sort({ createdAt: -1 });

const getTimeSlotById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid time slot ID', 400);
  }

  const slot = await TimeSlot.findById(id).populate(populatePhotographer);
  if (!slot) {
    throw new AppError('Time slot not found', 404);
  }
  return slot;
};

const updateTimeSlot = async (id, payload) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid time slot ID', 400);
  }

  const slot = await TimeSlot.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate(populatePhotographer);

  if (!slot) {
    throw new AppError('Time slot not found', 404);
  }
  return slot;
};

const deleteTimeSlot = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid time slot ID', 400);
  }

  const deleted = await TimeSlot.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('Time slot not found', 404);
  }
};

module.exports = {
  createTimeSlot,
  getAllTimeSlots,
  getTimeSlotById,
  updateTimeSlot,
  deleteTimeSlot,
};
