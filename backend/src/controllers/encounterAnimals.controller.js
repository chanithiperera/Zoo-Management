const mongoose = require('mongoose');
const EncounterAnimal = require('../models/EncounterAnimal.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

function getUploadedAnimalFile(req) {
  if (req.file) return req.file.path && req.file.path.startsWith('http') ? req.file.path : req.file.filename;
  if (Array.isArray(req.files) && req.files.length > 0) {
    const f = req.files.find((x) => x?.fieldname === 'image') || req.files[0];
    return f.path && f.path.startsWith('http') ? f.path : f.filename;
  }
  return null;
}

function normalizeAnimalPayload(body = {}) {
  const o = { ...body };
  if (o.age !== undefined && o.age !== '') {
    const n = Number(o.age);
    o.age = Number.isNaN(n) ? 0 : n;
  }
  delete o.image;
  return o;
}

exports.addAnimal = asyncHandler(async (req, res) => {
  const fileName = getUploadedAnimalFile(req) || '';
  const normalized = normalizeAnimalPayload(req.body);

  const animalData = {
    ...normalized,
    imageUrl: fileName 
      ? (fileName.startsWith('http') ? fileName : `/uploads/animals/${fileName}`) 
      : '/uploads/animals/default.jpg',
  };

  const animal = await EncounterAnimal.create({ ...animalData, type: 'animal' });
  res.status(201).json({ success: true, message: 'Saved!', data: animal });
});

exports.getAllAnimals = asyncHandler(async (req, res) => {
  const { search, species, category } = req.query;
  const query = {};
  if (species) query.species = { $regex: species.trim(), $options: 'i' };
  if (category && category !== 'All') query.category = category;
  if (search) query.name = { $regex: search, $options: 'i' };

  const animals = await EncounterAnimal.find({ ...query, type: 'animal' }).sort({ name: 1 });
  res.status(200).json({
    success: true,
    count: animals.length,
    data: animals,
  });
});

exports.getAnimalById = asyncHandler(async (req, res) => {
  const animal = await EncounterAnimal.findOne({ _id: req.params.id, type: 'animal' });
  if (!animal) throw new AppError('Encounter animal not found', 404);
  res.status(200).json({ success: true, data: animal });
});

exports.updateAnimal = asyncHandler(async (req, res) => {
  const updateData = normalizeAnimalPayload(req.body);
  const uploaded = getUploadedAnimalFile(req);
  if (uploaded) {
    updateData.imageUrl = uploaded.startsWith('http') ? uploaded : `/uploads/animals/${uploaded}`;
  }
  
  const updatedAnimal = await EncounterAnimal.findOneAndUpdate(
    { _id: req.params.id, type: 'animal' },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedAnimal) throw new AppError('Encounter animal not found', 404);
  res.status(200).json({ success: true, data: updatedAnimal });
});

exports.deleteAnimal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid ID format', 400);
  }

  const deletedAnimal = await EncounterAnimal.findOneAndDelete({ _id: id, type: 'animal' });
  if (!deletedAnimal) throw new AppError('Encounter animal not found', 404);

  res.status(200).json({
    success: true,
    message: 'Encounter animal deleted successfully',
  });
});
