const User = require('../models/User.model');
const TicketCatalog = require('../models/TicketCatalog.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

function toCatalogCode(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
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
  const { name, priceLkr, timeLabel, imageUrl } = req.body;
  const item = await TicketCatalog.findById(id);
  if (!item || !item.active || item.category !== 'show') {
    throw new AppError('Show not found', 404);
  }
  item.name = String(name).trim();
  item.priceLkr = Number(priceLkr);
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
  const { name, priceLkr, timeLabel, imageUrl } = req.body;
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
};
