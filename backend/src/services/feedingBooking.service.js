const FeedingBooking = require('../models/FeedingBooking.model');
const TimeSlot = require('../models/TimeSlot.model');
const AppError = require('../utils/AppError');

const createBooking = async (payload) => {
  const booking = await FeedingBooking.create(payload);
  return booking;
};

const getAllBookings = async (filters = {}) => {
  const query = {};
  if (filters.animalName) {
    query.animalName = filters.animalName;
  }
  if (filters.date) {
    const date = new Date(filters.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    query.date = { $gte: startOfDay, $lte: endOfDay };
  }
  return FeedingBooking.find(query).sort({ createdAt: -1 });
};

const updateBooking = async (id, payload) => {
  const booking = await FeedingBooking.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!booking) throw new AppError('Booking not found', 404);
  return booking;
};

const deleteBooking = async (id) => {
  const booking = await FeedingBooking.findByIdAndDelete(id);
  if (!booking) throw new AppError('Booking not found', 404);
  
  // Release the time slot
  if (booking && booking.timeSlotId) {
    try {
      await TimeSlot.findByIdAndUpdate(booking.timeSlotId, { $set: { isBooked: false } });
    } catch (slotErr) {
      console.error('Error releasing feeding slot:', slotErr);
    }
  }
  return booking;
};

module.exports = {
  createBooking,
  getAllBookings,
  updateBooking,
  deleteBooking,
};
