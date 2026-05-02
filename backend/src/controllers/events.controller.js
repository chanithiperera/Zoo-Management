const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Event = require('../models/Event.model');

// GET /api/events
exports.getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ eventDate: 1 });
  res.status(200).json({ success: true, count: events.length, data: events });
});

// GET /api/events/:id
exports.getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError('Event not found', 404);
  res.status(200).json({ success: true, data: event });
});

// POST /api/events
exports.createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json({ success: true, data: event });
});

// PUT /api/events/:id
exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!event) throw new AppError('Event not found', 404);
  res.status(200).json({ success: true, data: event });
});

// DELETE /api/events/:id
exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) throw new AppError('Event not found', 404);
  res.status(200).json({ success: true, data: {} });
});
