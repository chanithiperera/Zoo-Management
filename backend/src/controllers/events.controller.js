const Event = require("../models/Event.model");
const Booking = require("../models/EventBooking.model");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

// Handles arrays from both form-data (multiple values or comma-string) and JSON
const parseField = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : [p]; } catch {}
  return val.split(",").map(s => s.trim()).filter(Boolean);
};

// ─── ADMIN: Create Event ───────────────────────────────────────────────────────
const createEvent = asyncHandler(async (req, res) => {
  const {
    title, description, eventType, venue,
    capacity, pricePerPerson, availableDates,
    duration, includes, requirements,
  } = req.body;

  // Priority: uploaded file > URL from body > null
  const imageUrl = req.file
    ? `/uploads/events/${req.file.filename}`
    : (req.body.imageUrl || null);

  const event = await Event.create({
    title,
    description,
    eventType,
    venue,
    capacity:       Number(capacity),
    pricePerPerson: Number(pricePerPerson),
    availableDates: parseField(availableDates),
    duration,
    includes:       parseField(includes),
    requirements,
    imageUrl,
  });

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: event,
  });
});

// ─── PUBLIC: Get All Events ────────────────────────────────────────────────────
const getAllEvents = asyncHandler(async (req, res) => {
  const { eventType, search } = req.query;
  const filter = { isActive: true };

  if (eventType) filter.eventType = eventType;
  if (search) filter.title = { $regex: search, $options: "i" };

  const events = await Event.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});

// ─── PUBLIC: Get Single Event ──────────────────────────────────────────────────
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError("Event not found", 404);

  // Find which dates are already booked (not cancelled/rejected)
  const bookedDates = await Booking.find({
    eventId: event._id,
    status: { $nin: ["Cancelled", "Rejected"] },
  }).select("eventDate");

  const bookedDateStrings = bookedDates.map(b =>
    new Date(b.eventDate).toDateString()
  );

  // Filter out booked dates from availableDates
  const availableDates = (event.availableDates || []).filter(
    d => !bookedDateStrings.includes(new Date(d).toDateString())
  );

  res.status(200).json({
    success: true,
    data: { ...event.toObject(), availableDates },
  });
});

// ─── ADMIN: Update Event ───────────────────────────────────────────────────────
const updateEvent = asyncHandler(async (req, res) => {
  const updates = { ...req.body };

  // Parse array fields from form-data
  if (updates.availableDates) updates.availableDates = parseField(updates.availableDates);
  if (updates.includes)       updates.includes       = parseField(updates.includes);

  // Handle number fields
  if (updates.capacity)       updates.capacity       = Number(updates.capacity);
  if (updates.pricePerPerson) updates.pricePerPerson = Number(updates.pricePerPerson);

  // Handle image — uploaded file takes priority over URL
  if (req.file)               updates.imageUrl = `/uploads/events/${req.file.filename}`;
  else if (updates.imageUrl)  updates.imageUrl = updates.imageUrl; // keep as-is (URL string)

  const event = await Event.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!event) throw new AppError("Event not found", 404);

  res.status(200).json({
    success: true,
    message: "Event updated successfully",
    data: event,
  });
});

// ─── ADMIN: Delete Event ───────────────────────────────────────────────────────
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) throw new AppError("Event not found", 404);

  res.status(200).json({
    success: true,
    message: "Event deleted successfully",
  });
});

// ─── USER: Book an Event ───────────────────────────────────────────────────────
const bookEvent = asyncHandler(async (req, res) => {
  const { eventDate, guestCount, specialRequests, contactPhone } = req.body;
  const eventId = req.params.id;
  const userId  = req.user._id;

  const event = await Event.findById(eventId);
  if (!event || !event.isActive) throw new AppError("Event not found", 404);

  if (guestCount > event.capacity)
    throw new AppError(`Maximum capacity is ${event.capacity} guests`, 400);

  const conflict = await Booking.findOne({
    eventId,
    eventDate: new Date(eventDate),
    status: { $nin: ["Cancelled", "Rejected"] },
  });
  if (conflict)
    throw new AppError("This date is already booked. Please choose another date.", 409);

  const totalPrice = event.pricePerPerson * guestCount;

  const booking = await Booking.create({
    userId,
    eventId,
    eventDate: new Date(eventDate),
    guestCount,
    totalPrice,
    specialRequests,
    contactPhone,
  });

  await booking.populate("eventId", "title venue eventType imageUrl");

  res.status(201).json({
    success: true,
    message: "Booking request submitted successfully",
    data: booking,
  });
});

// ─── USER: My Bookings ─────────────────────────────────────────────────────────
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate("eventId", "title venue eventType imageUrl pricePerPerson")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// ─── USER: Cancel Booking ──────────────────────────────────────────────────────
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    userId: req.user._id,
  });

  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.status === "Cancelled") throw new AppError("Booking is already cancelled", 400);
  if (booking.status !== "Pending") {
    throw new AppError("Only pending bookings can be cancelled", 400);
  }

  booking.status = "Cancelled";
  await booking.save();

  res.status(200).json({
    success: true,
    message: "Booking cancelled successfully",
    data: booking,
  });
});

// ─── ADMIN: Get All Bookings ───────────────────────────────────────────────────
const getAllBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate("eventId", "title venue eventType")
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// ─── ADMIN: Update Booking Status ─────────────────────────────────────────────
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["Pending", "Confirmed", "Rejected", "Cancelled"];
  if (!allowed.includes(status))
    throw new AppError("Invalid status value", 400);

  const booking = await Booking.findByIdAndUpdate(
    req.params.bookingId,
    { status },
    { new: true }
  ).populate("eventId", "title venue");

  if (!booking) throw new AppError("Booking not found", 404);

  res.status(200).json({
    success: true,
    message: `Booking ${status.toLowerCase()} successfully`,
    data: booking,
  });
});

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  bookEvent,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
};
