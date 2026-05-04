const mongoose = require('mongoose');
const PhotographyPackage = require('../models/PhotographyPackage.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.createPackage = asyncHandler(async (req, res) => {
  const photographyPackage = await PhotographyPackage.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Photography package created successfully',
    data: photographyPackage,
  });
});

exports.getAllPackages = asyncHandler(async (req, res) => {
  const packages = await PhotographyPackage.find()
    .populate({ path: 'animalsIncluded', select: 'name species isAvailableForPhotography' })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: packages.length,
    data: packages,
  });
});

exports.getPackageById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid package ID', 400);
  }

  const photographyPackage = await PhotographyPackage.findById(id).populate({
    path: 'animalsIncluded',
    select: 'name species isAvailableForPhotography',
  });

  if (!photographyPackage) {
    throw new AppError('Photography package not found', 404);
  }

  res.status(200).json({
    success: true,
    data: photographyPackage,
  });
});

exports.updatePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid package ID', 400);
  }

  const updatedPackage = await PhotographyPackage.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate({ path: 'animalsIncluded', select: 'name species isAvailableForPhotography' });

  if (!updatedPackage) {
    throw new AppError('Photography package not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Photography package updated successfully',
    data: updatedPackage,
  });
});

exports.deletePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid package ID', 400);
  }

  const deletedPackage = await PhotographyPackage.findByIdAndDelete(id);
  if (!deletedPackage) {
    throw new AppError('Photography package not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Photography package deleted successfully',
  });
});

exports.archivePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid package ID', 400);
  }

  const archivedPackage = await PhotographyPackage.findByIdAndUpdate(
    id,
    { isArchived: true },
    { new: true, runValidators: true }
  ).populate({ path: 'animalsIncluded', select: 'name species isAvailableForPhotography' });

  if (!archivedPackage) {
    throw new AppError('Photography package not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Photography package archived successfully',
    data: archivedPackage,
  });
});
