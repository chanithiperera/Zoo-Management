const mongoose = require('mongoose');
const Photographer = require('../models/Photographer.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.addPhotographer = asyncHandler(async (req, res) => {
  const photographer = await Photographer.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Photographer added successfully',
    data: photographer,
  });
});

exports.getAllPhotographers = asyncHandler(async (req, res) => {
  const photographers = await Photographer.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: photographers.length,
    data: photographers,
  });
});

exports.getPhotographerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid photographer ID', 400);
  }

  const photographer = await Photographer.findById(id);
  if (!photographer) {
    throw new AppError('Photographer not found', 404);
  }

  res.status(200).json({
    success: true,
    data: photographer,
  });
});

exports.updatePhotographer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid photographer ID', 400);
  }

  const updatedPhotographer = await Photographer.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedPhotographer) {
    throw new AppError('Photographer not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Photographer profile updated successfully',
    data: updatedPhotographer,
  });
});

exports.deletePhotographer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid photographer ID', 400);
  }

  const deletedPhotographer = await Photographer.findByIdAndDelete(id);
  if (!deletedPhotographer) {
    throw new AppError('Photographer not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Photographer deleted successfully',
  });
});

exports.deactivatePhotographer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid photographer ID', 400);
  }

  const photographer = await Photographer.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true, runValidators: true }
  );

  if (!photographer) {
    throw new AppError('Photographer not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Photographer deactivated successfully',
    data: photographer,
  });
});

exports.addPhotographerRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const submittedRating = Number(req.body.rating);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid photographer ID', 400);
  }
  if (!Number.isFinite(submittedRating) || submittedRating < 0 || submittedRating > 5) {
    throw new AppError('rating must be a number between 0 and 5', 400);
  }

  const photographer = await Photographer.findById(id);
  if (!photographer) {
    throw new AppError('Photographer not found', 404);
  }

  const nextRatingCount = (photographer.ratingCount || 0) + 1;
  const nextRatingTotal = (photographer.ratingTotal || 0) + submittedRating;
  photographer.ratingCount = nextRatingCount;
  photographer.ratingTotal = nextRatingTotal;
  photographer.rating = Number((nextRatingTotal / nextRatingCount).toFixed(2));

  await photographer.save();

  res.status(200).json({
    success: true,
    message: 'Photographer rating added successfully',
    data: photographer,
  });
});
