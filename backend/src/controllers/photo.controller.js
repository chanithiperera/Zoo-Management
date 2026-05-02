const mongoose = require('mongoose');
const Photo = require('../models/Photo.model');
const PhotographyBooking = require('../models/PhotographyBooking.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const path = require('path');

exports.uploadPhoto = asyncHandler(async (req, res) => {
  console.log('--- UPLOAD DEBUG ---');
  console.log('HEADERS:', req.headers['content-type']);
  console.log('BODY:', req.body);
  
  const bookingId = req.body.booking || null;

  // Handle both req.files (array) and req.file (single) from multer
  let uploadedFiles = [];
  if (req.files && Array.isArray(req.files)) {
    uploadedFiles = req.files;
  } else if (req.file) {
    uploadedFiles = [req.file];
  } else if (req.files && typeof req.files === 'object') {
    // Handle upload.fields() or other multer variations
    Object.values(req.files).forEach(fileArray => {
      if (Array.isArray(fileArray)) uploadedFiles.push(...fileArray);
    });
  }

  console.log('DETECTED FILES:', uploadedFiles.length);

  if (!uploadedFiles.length) {
    return res.status(400).json({
      success: false,
      message: 'The server did not receive any photo files. Check if you selected images correctly.',
      debug: {
        bodyKeys: Object.keys(req.body),
        hasFiles: !!req.files,
        isFilesArray: Array.isArray(req.files),
        photosFieldInBody: !!req.body.photos
      }
    });
  }

  const docs = uploadedFiles.map((file) => ({
    ...(bookingId && { booking: bookingId }),
    imageUrl: `/uploads/photos/${file.filename}`,
    caption: req.body.caption || 'Zoo Memory',
    description: req.body.description || '',
    bestMoment: req.body.bestMoment || '',
    isFavorite: false,
  }));

  try {
    const createdPhotos = await Photo.insertMany(docs);
    res.status(201).json({
      success: true,
      message: 'Photos uploaded successfully!',
      count: createdPhotos.length,
      data: createdPhotos,
    });
  } catch (err) {
    console.error('Save Error:', err);
    res.status(500).json({
      success: false,
      message: 'Database error while saving photos.',
      error: err.message
    });
  }
});

exports.getAllPhotos = asyncHandler(async (req, res) => {
  const photos = await Photo.find().populate('booking').sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: photos });
});

exports.getPhotosByBookingId = asyncHandler(async (req, res) => {
  const photos = await Photo.find({ booking: req.params.bookingId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: photos });
});

exports.updatePhoto = asyncHandler(async (req, res) => {
  const photo = await Photo.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({ success: true, data: photo });
});

exports.deletePhoto = asyncHandler(async (req, res) => {
  await Photo.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Photo deleted' });
});

exports.markPhotoFavorite = asyncHandler(async (req, res) => {
  const photo = await Photo.findByIdAndUpdate(req.params.id, { isFavorite: true }, { new: true });
  res.status(200).json({ success: true, data: photo });
});
