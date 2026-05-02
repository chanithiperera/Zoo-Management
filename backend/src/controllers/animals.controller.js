<<<<<<< HEAD
const mongoose = require('mongoose');
const Animal = require('../models/Animal.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.addAnimal = asyncHandler(async (req, res) => {
  console.log('--- ANIMAL ADD ---');
  let fileName = '';
  if (req.file) {
    fileName = req.file.filename;
  } else if (req.files && req.files.length > 0) {
    fileName = req.files[0].filename;
  }

  const animalData = { 
    ...req.body,
    imageUrl: fileName ? `/uploads/animals/${fileName}` : '/uploads/animals/default.jpg'
  };

  try {
    const animal = await Animal.create(animalData);
    res.status(201).json({ success: true, message: 'Saved!', data: animal });
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});

exports.getAllAnimals = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.species) {
    query.species = { $regex: req.query.species.trim(), $options: 'i' };
  }
  const animals = await Animal.find(query).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: animals });
});

exports.getAnimalById = asyncHandler(async (req, res) => {
  const animal = await Animal.findById(req.params.id);
  res.status(200).json({ success: true, data: animal });
});

exports.updateAnimal = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.file) updateData.imageUrl = `/uploads/animals/${req.file.filename}`;
  
  const updatedAnimal = await Animal.findByIdAndUpdate(req.params.id, updateData, { new: true });
  res.status(200).json({ success: true, data: updatedAnimal });
});

exports.deleteAnimal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log('--- ATTEMPTING DELETE ---');
  console.log('ID received:', id);

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({ success: false, message: 'Invalid ID format' });
    }

    const deletedAnimal = await Animal.findByIdAndDelete(id);
    console.log('Delete result:', !!deletedAnimal);

    if (!deletedAnimal) {
      return res.status(200).json({ success: false, message: 'Animal not found in database' });
    }

    res.status(200).json({
      success: true,
      message: 'Animal deleted successfully'
    });
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(200).json({ success: false, message: 'Server error: ' + err.message });
  }
});

exports.markAnimalUnavailable = asyncHandler(async (req, res) => {
  const animal = await Animal.findByIdAndUpdate(req.params.id, { isAvailableForPhotography: false }, { new: true });
  res.status(200).json({ success: true, data: animal });
=======
const asyncHandler = require('../utils/asyncHandler');

/** Prepared for Phase 2 — Animal Information & Education */
exports.getModuleInfo = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Animals module — prepared for Phase 2',
    data: { module: 'animals' },
  });
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
});
