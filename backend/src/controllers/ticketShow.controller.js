const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const TicketCatalog = require('../models/TicketCatalog.model');
const TicketBooking = require('../models/TicketBooking.model');
const DEFAULT_SHOW_DAILY_CAPACITY = 100;

function toBookingItem(catalogItem, quantity) {
  const unitPriceLkr = Number(catalogItem.priceLkr || 0);
  return {
    itemCode: catalogItem.code,
    itemName: catalogItem.name,
    quantity,
    unitPriceLkr,
    lineTotalLkr: unitPriceLkr * quantity,
  };
}

function createConfirmationCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `ZM-${stamp}-${random}`;
}

async function normalizeSelectedItems(rawItems, category) {
  const selected = Array.isArray(rawItems) ? rawItems : [];
  const positiveItems = selected.filter((item) => Number(item.quantity) > 0);
  if (!positiveItems.length) return [];

  const codes = [...new Set(positiveItems.map((item) => String(item.itemCode).trim()))];
  const catalogItems = await TicketCatalog.find({
    code: { $in: codes },
    category,
    active: true,
  }).lean();
  const byCode = new Map(catalogItems.map((item) => [item.code, item]));

  return positiveItems.map((item) => {
    const itemCode = String(item.itemCode).trim();
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new AppError(`Invalid quantity for item ${itemCode}`, 400);
    }
    const catalogItem = byCode.get(itemCode);
    if (!catalogItem) {
      throw new AppError(`Unknown or inactive ${category} item: ${itemCode}`, 400);
    }
    return toBookingItem(catalogItem, quantity);
  });
}

/** Prepared for Phase 2 — Ticket & Show Management */
exports.getModuleInfo = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ticket & Show module — prepared for Phase 2',
    data: { module: 'ticketShow' },
  });
});

exports.getCatalog = asyncHandler(async (req, res) => {
  const catalog = await TicketCatalog.find({ active: true }).sort({ category: 1, code: 1 }).lean();
  const entryTickets = catalog.filter((item) => item.category === 'entry');
  const shows = catalog.filter((item) => item.category === 'show');

  res.status(200).json({
    success: true,
    message: 'Ticket catalog loaded',
    data: { entryTickets, shows },
  });
});

exports.createBooking = asyncHandler(async (req, res) => {
  const { visitDate, payment } = req.body;
  const entryItems = await normalizeSelectedItems(req.body.entryItems, 'entry');
  const showItems = await normalizeSelectedItems(req.body.showItems, 'show');

  if (!entryItems.length) {
    throw new AppError('At least one entry ticket is required', 400);
  }

  if (showItems.length) {
    const requestedShowCodes = [...new Set(showItems.map((item) => item.itemCode))];
    const activeShows = await TicketCatalog.find({
      category: 'show',
      active: true,
      code: { $in: requestedShowCodes },
    })
      .select('code name dailyCapacity')
      .lean();
    const showByCode = new Map(activeShows.map((show) => [show.code, show]));

    const sameDayBookings = await TicketBooking.find({
      visitDate,
      status: 'confirmed',
      paymentStatus: 'paid',
      'showItems.itemCode': { $in: requestedShowCodes },
    })
      .select('showItems')
      .lean();

    const alreadyBookedByCode = new Map();
    for (const booking of sameDayBookings) {
      for (const bookedShowItem of booking.showItems || []) {
        if (!requestedShowCodes.includes(bookedShowItem.itemCode)) continue;
        const nextBookedQty =
          (alreadyBookedByCode.get(bookedShowItem.itemCode) || 0) + Number(bookedShowItem.quantity || 0);
        alreadyBookedByCode.set(bookedShowItem.itemCode, nextBookedQty);
      }
    }

    for (const requestedShowItem of showItems) {
      const showConfig = showByCode.get(requestedShowItem.itemCode);
      if (!showConfig) {
        throw new AppError(`Unknown or inactive show item: ${requestedShowItem.itemCode}`, 400);
      }
      const dailyCapacity = Number(showConfig.dailyCapacity) || DEFAULT_SHOW_DAILY_CAPACITY;
      const alreadyBookedQty = alreadyBookedByCode.get(requestedShowItem.itemCode) || 0;
      const nextBookedQty = alreadyBookedQty + Number(requestedShowItem.quantity || 0);

      if (nextBookedQty > dailyCapacity) {
        throw new AppError(`No seats left for ${showConfig.name} on ${visitDate}.`, 400);
      }
    }
  }

  const entrySubtotalLkr = entryItems.reduce((sum, item) => sum + item.lineTotalLkr, 0);
  const showsSubtotalLkr = showItems.reduce((sum, item) => sum + item.lineTotalLkr, 0);
  const totalLkr = entrySubtotalLkr + showsSubtotalLkr;

  const booking = await TicketBooking.create({
    userId: req.user._id,
    visitDate,
    entryItems,
    showItems,
    entrySubtotalLkr,
    showsSubtotalLkr,
    totalLkr,
    status: 'confirmed',
    paymentStatus: 'paid',
    payment: {
      cardholderName: payment.cardholderName.trim(),
      cardLast4: payment.cardNumber.slice(-4),
      method: 'card',
    },
    confirmationCode: createConfirmationCode(),
  });

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: { booking },
  });
});

exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await TicketBooking.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.status(200).json({
    success: true,
    message: 'Bookings loaded',
    data: { bookings },
  });
});

exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await TicketBooking.findById(req.params.id).lean();
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  const isOwner = String(booking.userId) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new AppError('You do not have permission to view this booking', 403);
  }

  res.status(200).json({
    success: true,
    message: 'Booking loaded',
    data: { booking },
  });
});

exports.verifyEntry = asyncHandler(async (req, res) => {
  const { bookingId, confirmationCode } = req.body;
  const booking = await TicketBooking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.confirmationCode !== String(confirmationCode).trim()) {
    throw new AppError('Invalid confirmation code', 400);
  }

  if (booking.status !== 'confirmed' || booking.paymentStatus !== 'paid') {
    throw new AppError('This booking is not eligible for entry', 400);
  }

  if (booking.entryStatus === 'used') {
    return res.status(200).json({
      success: true,
      message: 'Pass already used',
      data: { booking, valid: false, alreadyUsed: true },
    });
  }

  booking.entryStatus = 'used';
  booking.checkedInAt = new Date();
  await booking.save();

  res.status(200).json({
    success: true,
    message: 'Pass verified and marked as used',
    data: { booking, valid: true, alreadyUsed: false },
  });
});
