const fs = require('fs');
const path = require('path');
const User = require('../models/User.model');
const TicketCatalog = require('../models/TicketCatalog.model');
const TicketBooking = require('../models/TicketBooking.model');
const GroupBookingRequest = require('../models/GroupBookingRequest.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;
const DEFAULT_SHOW_DAILY_CAPACITY = 100;

function toCatalogCode(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function toTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    message: 'Users loaded',
    data: { users },
  });
});

const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, role } = req.body;
  const nextEmail = email.trim().toLowerCase();
  const taken = await User.findOne({ email: nextEmail });
  if (taken) {
    throw new AppError('An account with this email already exists', 409);
  }
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const created = await User.create({
    fullName: fullName.trim(),
    email: nextEmail,
    phone: phone.trim(),
    password: hashedPassword,
    role,
  });
  const safeUser = await User.findById(created._id).select('-password');
  res.status(201).json({
    success: true,
    message: 'User created',
    data: { user: safeUser },
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, email, phone, role } = req.body;
  const nextEmail = email.trim().toLowerCase();

  const existing = await User.findById(id).select('email');
  if (!existing) {
    throw new AppError('User not found', 404);
  }
  if (nextEmail !== existing.email) {
    const taken = await User.findOne({ email: nextEmail, _id: { $ne: id } });
    if (taken) {
      throw new AppError('An account with this email already exists', 409);
    }
  }

  const updated = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        fullName: fullName.trim(),
        email: nextEmail,
        phone: phone.trim(),
        role,
      },
    },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    message: 'User updated',
    data: { user: updated },
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('User not found', 404);
  }
  res.status(200).json({
    success: true,
    message: 'User deleted',
    data: {},
  });
});

const listTicketCatalog = asyncHandler(async (req, res) => {
  const catalog = await TicketCatalog.find({ active: true }).sort({ category: 1, code: 1 }).lean();
  const entryTickets = catalog.filter((item) => item.category === 'entry');
  const shows = catalog.filter((item) => item.category === 'show');
  res.status(200).json({
    success: true,
    message: 'Ticket catalog loaded',
    data: { entryTickets, shows },
  });
});

const updateEntryCatalogItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, priceLkr } = req.body;
  const item = await TicketCatalog.findById(id);
  if (!item || !item.active || item.category !== 'entry') {
    throw new AppError('Entry ticket not found', 404);
  }
  item.name = String(name).trim();
  item.priceLkr = Number(priceLkr);
  await item.save();
  res.status(200).json({
    success: true,
    message: 'Entry ticket updated',
    data: { item },
  });
});

const updateShowCatalogItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, priceLkr, timeLabel, imageUrl, dailyCapacity } = req.body;
  const item = await TicketCatalog.findById(id);
  if (!item || !item.active || item.category !== 'show') {
    throw new AppError('Show not found', 404);
  }
  item.name = String(name).trim();
  item.priceLkr = Number(priceLkr);
  item.dailyCapacity = Number.isInteger(Number(dailyCapacity))
    ? Number(dailyCapacity)
    : item.dailyCapacity || DEFAULT_SHOW_DAILY_CAPACITY;
  item.meta = {
    ...(item.meta || {}),
    timeLabel: String(timeLabel).trim(),
  };
  if (typeof imageUrl === 'string' && imageUrl.trim()) {
    item.meta.imageUrl = imageUrl.trim();
  }
  await item.save();
  res.status(200).json({
    success: true,
    message: 'Show updated',
    data: { item },
  });
});

const createShowCatalogItem = asyncHandler(async (req, res) => {
  const { name, priceLkr, timeLabel, imageUrl, dailyCapacity } = req.body;
  const trimmedName = String(name).trim();
  const baseCode = toCatalogCode(trimmedName) || 'show';
  let code = baseCode;
  let suffix = 2;

  while (await TicketCatalog.exists({ code })) {
    code = `${baseCode}_${suffix}`;
    suffix += 1;
  }

  const created = await TicketCatalog.create({
    code,
    name: trimmedName,
    category: 'show',
    priceLkr: Number(priceLkr),
    active: true,
    dailyCapacity: Number.isInteger(Number(dailyCapacity))
      ? Number(dailyCapacity)
      : DEFAULT_SHOW_DAILY_CAPACITY,
    meta: {
      timeLabel: String(timeLabel).trim(),
      imageUrl: imageUrl ? String(imageUrl).trim() : '',
    },
  });

  res.status(201).json({
    success: true,
    message: 'Show created',
    data: { item: created },
  });
});

const deleteCatalogItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await TicketCatalog.findByIdAndDelete(id);
  if (!item) {
    throw new AppError('Catalog item not found', 404);
  }
  res.status(200).json({
    success: true,
    message: 'Catalog item deleted',
    data: {},
  });
});

const listBookings = asyncHandler(async (req, res) => {
  const visitDate = String(req.query.visitDate || '').trim() || toTodayDateKey();

  const bookings = await TicketBooking.find({ visitDate })
    .populate({ path: 'userId', select: 'fullName email phone' })
    .sort({ visitDate: 1, createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    message: 'Bookings loaded',
    data: { visitDate, bookings },
  });
});

const listGroupBookings = asyncHandler(async (req, res) => {
  const status = String(req.query.status || '').trim();
  const query = {};
  if (status) query.status = status;

  const groupBookings = await GroupBookingRequest.find(query)
    .populate({ path: 'userId', select: 'fullName email phone' })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    message: 'Group bookings loaded',
    data: { groupBookings },
  });
});

const updateGroupBookingStatus = asyncHandler(async (req, res) => {
  const request = await GroupBookingRequest.findById(req.params.id);
  if (!request) {
    throw new AppError('Group booking request not found', 404);
  }

  request.status = req.body.status;
  if (typeof req.body.reviewNotes === 'string') {
    request.reviewNotes = req.body.reviewNotes.trim();
  }
  await request.save();

  res.status(200).json({
    success: true,
    message: 'Group booking status updated',
    data: { groupBooking: request },
  });
});

function extractConfirmationCode(rawCode) {
  const trimmed = String(rawCode || '').trim();
  if (!trimmed) return '';
  // QR payload may be JSON like { bookingId, confirmationCode, visitDate }.
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      const fromPayload = parsed?.confirmationCode || parsed?.code;
      if (fromPayload) return String(fromPayload).trim();
    } catch (_err) {
      // fall through to plain code
    }
  }
  return trimmed;
}

const checkInBooking = asyncHandler(async (req, res) => {
  const code = extractConfirmationCode(req.body?.code);
  if (!code) {
    throw new AppError('Confirmation code is required', 400);
  }

  const booking = await TicketBooking.findOne({ confirmationCode: code }).populate({
    path: 'userId',
    select: 'fullName email phone',
  });

  if (!booking) {
    throw new AppError('Booking not found for this code', 404);
  }
  if (booking.status === 'cancelled') {
    throw new AppError('This booking has been cancelled', 400);
  }
  if (booking.entryStatus === 'used') {
    return res.status(409).json({
      success: false,
      message: 'This ticket has already been checked in',
      data: {
        booking,
        alreadyCheckedIn: true,
        checkedInAt: booking.checkedInAt,
      },
    });
  }

  const today = toTodayDateKey();
  const dateMatchesToday = booking.visitDate === today;

  booking.entryStatus = 'used';
  booking.checkedInAt = new Date();
  await booking.save();

  res.status(200).json({
    success: true,
    message: dateMatchesToday
      ? 'Check-in successful'
      : `Check-in successful (visit date is ${booking.visitDate}, not today)`,
    data: {
      booking,
      dateMatchesToday,
    },
  });
});

const uploadShowPoster = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No image file uploaded', 400);
  }
  const imageUrl = `/uploads/ticket-show/${req.file.filename}`;
  res.status(200).json({
    success: true,
    message: 'Show poster uploaded',
    data: { imageUrl },
  });
});

const downloadGroupBookingDocument = asyncHandler(async (req, res) => {
  const request = await GroupBookingRequest.findById(req.params.id).lean();
  if (!request) {
    throw new AppError('Group booking request not found', 404);
  }
  const storedPath = request.supportingDocument?.storedPath;
  if (!storedPath) {
    throw new AppError('No submitted document for this request', 404);
  }

  const normalized = String(storedPath).replace(/^\/+/, '');
  if (!normalized.startsWith('uploads/')) {
    throw new AppError('Invalid stored document path', 400);
  }
  const filePath = path.join(__dirname, '..', normalized);
  if (!fs.existsSync(filePath)) {
    throw new AppError('Submitted document file not found on server', 404);
  }

  const downloadName = request.supportingDocument?.fileName || path.basename(filePath);
  res.download(filePath, downloadName);
});

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listTicketCatalog,
  updateEntryCatalogItem,
  updateShowCatalogItem,
  createShowCatalogItem,
  deleteCatalogItem,
  listBookings,
  listGroupBookings,
  updateGroupBookingStatus,
  downloadGroupBookingDocument,
  checkInBooking,
  uploadShowPoster,
};
