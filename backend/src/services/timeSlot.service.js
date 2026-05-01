const mongoose = require('mongoose');
const TimeSlot = require('../models/TimeSlot.model');
const AppError = require('../utils/AppError');

const populatePhotographer = { path: 'photographer', select: 'name specialty isActive' };

const createTimeSlot = async (payload) => {
  try {
    // Only enforce photographer for photography type
    if (payload.type === 'Photography' && (!payload.photographer || payload.photographer === '')) {
      throw new AppError('A photographer must be assigned to photography slots.', 400);
    }

    const slot = await TimeSlot.create(payload);
    return slot.populate(populatePhotographer);
  } catch (error) {
    console.error('Service Create Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      throw new AppError(`Validation Error: ${messages.join(', ')}`, 400);
    }
    if (error.code === 11000) {
      throw new AppError('This exact time slot already exists.', 400);
    }
    throw error;
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
