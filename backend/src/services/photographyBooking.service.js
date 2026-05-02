const mongoose = require('mongoose');
const PhotographyBooking = require('../models/PhotographyBooking.model');
const TimeSlot = require('../models/TimeSlot.model');
const AppError = require('../utils/AppError');

const populateFields = [
  {
    path: 'animal',
    select:
      'name species age feedingSchedule isAvailableForPhotography healthStatus feedingRestrictions',
  },
  {
    path: 'package',
    select: 'name duration photoCount animalsIncluded price isArchived createdAt updatedAt',
    populate: {
      path: 'animalsIncluded',
      select: 'name species isAvailableForPhotography healthStatus',
    },
  },
  {
    path: 'photographer',
    select: 'name specialty portfolio hourlyRate availability rating isActive createdAt updatedAt',
  },
  {
    path: 'timeSlot',
    select: 'date startTime endTime isBooked photographer capacity',
  },
];

const getDayRange = (inputDate) => {
  const date = new Date(inputDate);
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return { startOfDay, endOfDay };
};

const ensureNoDoubleBooking = async ({ photographer, date, time, excludeId }) => {
  const { startOfDay, endOfDay } = getDayRange(date);
  const query = {
    photographer,
    time,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: 'cancelled' },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingBooking = await PhotographyBooking.findOne(query).select('_id');
  if (existingBooking) {
    throw new AppError('This photographer is already booked for the selected date and time slot', 409);
  }
};

const getTimeSlotOrThrow = async (timeSlotId) => {
  if (!timeSlotId || !mongoose.Types.ObjectId.isValid(timeSlotId)) {
    throw new AppError('Valid timeSlot ID is required', 400);
  }
  const timeSlot = await TimeSlot.findById(timeSlotId);
  if (!timeSlot) {
    throw new AppError('Time slot not found', 404);
  }
  return timeSlot;
};

const createBooking = async (payload) => {
  const { photographer, timeSlot: timeSlotId } = payload;
  const timeSlot = await getTimeSlotOrThrow(timeSlotId);

  if (timeSlot.isBooked) {
    throw new AppError('Selected time slot is already booked', 409);
  }
  if (String(timeSlot.photographer) !== String(photographer)) {
    throw new AppError('Time slot does not belong to the selected photographer', 400);
  }

  const bookingPayload = {
    ...payload,
    date: timeSlot.date,
    time: timeSlot.startTime,
  };

  await ensureNoDoubleBooking({
    photographer,
    date: bookingPayload.date,
    time: bookingPayload.time,
  });

  const booking = await PhotographyBooking.create(bookingPayload);
  await TimeSlot.findByIdAndUpdate(timeSlot._id, { $set: { isBooked: true } });
  return booking.populate(populateFields);
};

const getAllBookings = async (filters = {}) => {
  const query = {};

  if (filters.visitor) {
    query.visitorName = { $regex: filters.visitor.trim(), $options: 'i' };
  }

  if (filters.photographer && mongoose.Types.ObjectId.isValid(filters.photographer)) {
    query.photographer = filters.photographer;
  }

  if (filters.date) {
    const { startOfDay, endOfDay } = getDayRange(filters.date);
    query.date = { $gte: startOfDay, $lte: endOfDay };
  }

  return PhotographyBooking.find(query).populate(populateFields).sort({ createdAt: -1 });
};

const getBookingById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid booking ID', 400);
  }
  const booking = await PhotographyBooking.findById(id).populate(populateFields);
  if (!booking) {
    throw new AppError('Photography booking not found', 404);
  }
  return booking;
};

const updateBooking = async (id, payload) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid booking ID', 400);
  }

  const existingBooking = await PhotographyBooking.findById(id);
  if (!existingBooking) {
    throw new AppError('Photography booking not found', 404);
  }

  const nextPhotographer = payload.photographer || existingBooking.photographer;
  const nextStatus = payload.status || existingBooking.status;
  const nextTimeSlotId = payload.timeSlot || existingBooking.timeSlot;
  const timeSlotChanged = String(nextTimeSlotId) !== String(existingBooking.timeSlot);
  const nextTimeSlot = await getTimeSlotOrThrow(nextTimeSlotId);

  if (String(nextTimeSlot.photographer) !== String(nextPhotographer)) {
    throw new AppError('Time slot does not belong to the selected photographer', 400);
  }
  if (
    (timeSlotChanged || nextStatus === 'booked') &&
    nextTimeSlot.isBooked &&
    String(nextTimeSlot._id) !== String(existingBooking.timeSlot)
  ) {
    throw new AppError('Selected time slot is already booked', 409);
  }

  await ensureNoDoubleBooking({
    photographer: nextPhotographer,
    date: nextTimeSlot.date,
    time: nextTimeSlot.startTime,
    excludeId: id,
  });

  const updatedBooking = await PhotographyBooking.findByIdAndUpdate(
    id,
    {
      ...payload,
      date: nextTimeSlot.date,
      time: nextTimeSlot.startTime,
      timeSlot: nextTimeSlotId,
    },
    { new: true, runValidators: true }
  ).populate(populateFields);

  if (timeSlotChanged) {
    await TimeSlot.findByIdAndUpdate(existingBooking.timeSlot, { $set: { isBooked: false } });
    if (nextStatus !== 'cancelled') {
      await TimeSlot.findByIdAndUpdate(nextTimeSlotId, { $set: { isBooked: true } });
    }
  } else {
    await TimeSlot.findByIdAndUpdate(nextTimeSlotId, { $set: { isBooked: nextStatus !== 'cancelled' } });
  }

  return updatedBooking;
};

const deleteBooking = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid booking ID', 400);
  }
  const deletedBooking = await PhotographyBooking.findByIdAndDelete(id);
  if (!deletedBooking) {
    throw new AppError('Photography booking not found', 404);
  }
  if (deletedBooking && deletedBooking.timeSlot) {
    try {
      await TimeSlot.findByIdAndUpdate(deletedBooking.timeSlot, { $set: { isBooked: false } });
    } catch (slotErr) {
      console.error('Error releasing slot during deletion:', slotErr);
    }
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};
