const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const StoreItem = require('../models/StoreItem.model');

// GET /api/store
exports.getAllItems = asyncHandler(async (req, res) => {
  const items = await StoreItem.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: items.length, data: items });
});

// GET /api/store/:id
exports.getItemById = asyncHandler(async (req, res) => {
  const item = await StoreItem.findById(req.params.id);
  if (!item) throw new AppError('Store item not found', 404);
  res.status(200).json({ success: true, data: item });
});

// POST /api/store
exports.createItem = asyncHandler(async (req, res) => {
  const item = await StoreItem.create(req.body);
  res.status(201).json({ success: true, data: item });
});

// PUT /api/store/:id
exports.updateItem = asyncHandler(async (req, res) => {
  const item = await StoreItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) throw new AppError('Store item not found', 404);
  res.status(200).json({ success: true, data: item });
});

// DELETE /api/store/:id
exports.deleteItem = asyncHandler(async (req, res) => {
  const item = await StoreItem.findByIdAndDelete(req.params.id);
  if (!item) throw new AppError('Store item not found', 404);
  res.status(200).json({ success: true, data: {} });
});
