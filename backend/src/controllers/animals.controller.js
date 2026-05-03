const mongoose = require('mongoose');
const Animal = require('../models/Animal.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/** Multer: `.single('field')` sets `req.file`; `.any()` / `.array()` set `req.files`. */
function getUploadedAnimalFile(req) {
  if (req.file?.filename) return req.file.filename;
  if (Array.isArray(req.files) && req.files.length > 0) {
    const f = req.files.find((x) => x?.fieldname === 'image') || req.files[0];
    return f.filename;
  }
  return null;
}

function parseFunFacts(val) {
  if (val == null || val === '') return [];
  if (Array.isArray(val)) return val.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed.map(String).map((s) => s.trim()).filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Multipart sends string fields; funFacts is JSON string from the app. */
function normalizeAnimalPayload(body = {}) {
  const o = { ...body };
  o.funFacts = parseFunFacts(o.funFacts);
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
    imageUrl: fileName ? `/uploads/animals/${fileName}` : '/uploads/animals/default.jpg',
  };

  const animal = await Animal.create(animalData);
  res.status(201).json({ success: true, message: 'Saved!', data: animal });
});

exports.getAllAnimals = asyncHandler(async (req, res) => {
  const { search, species, category } = req.query;
  const query = {};
  if (species) query.species = { $regex: species.trim(), $options: 'i' };
  if (category && category !== 'All') query.category = category;
  if (search) query.name = { $regex: search, $options: 'i' };

  const animals = await Animal.find(query).sort({ name: 1 });
  res.status(200).json({
    success: true,
    count: animals.length,
    data: animals,
  });
});

exports.getRandomFact = asyncHandler(async (req, res) => {
  const count = await Animal.countDocuments();
  if (!count) {
    return res.status(200).json({
      success: true,
      data: {
        animalName: 'Zoo',
        fact: 'Did you know that zoos play a critical role in conservation?',
      },
    });
  }

  const random = Math.floor(Math.random() * count);
  const animal = await Animal.findOne().skip(random);

  if (!animal || !animal.funFacts || animal.funFacts.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        animalName: 'Zoo',
        fact: 'Did you know that zoos play a critical role in conservation?',
      },
    });
  }

  const randomFactIndex = Math.floor(Math.random() * animal.funFacts.length);
  res.status(200).json({
    success: true,
    data: {
      animalName: animal.name,
      fact: animal.funFacts[randomFactIndex],
    },
  });
});

exports.getAnimalById = asyncHandler(async (req, res) => {
  const animal = await Animal.findById(req.params.id);
  if (!animal) throw new AppError('Animal not found', 404);
  res.status(200).json({ success: true, data: animal });
});

exports.updateAnimal = asyncHandler(async (req, res) => {
  const updateData = normalizeAnimalPayload(req.body);
  const uploaded = getUploadedAnimalFile(req);
  if (uploaded) updateData.imageUrl = `/uploads/animals/${uploaded}`;
  const ageRaw = updateData.age;
  if (ageRaw !== undefined && ageRaw !== '') {
    const n = Number(ageRaw);
    if (!Number.isNaN(n)) updateData.age = n;
  }

  const updatedAnimal = await Animal.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updatedAnimal) throw new AppError('Animal not found', 404);
  res.status(200).json({ success: true, data: updatedAnimal });
});

exports.deleteAnimal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid ID format', 400);
  }

  const deletedAnimal = await Animal.findByIdAndDelete(id);
  if (!deletedAnimal) throw new AppError('Animal not found', 404);

  res.status(200).json({
    success: true,
    message: 'Animal deleted successfully',
  });
});

exports.markAnimalUnavailable = asyncHandler(async (req, res) => {
  const animal = await Animal.findByIdAndUpdate(
    req.params.id,
    { isAvailableForPhotography: false },
    { new: true }
  );
  if (!animal) throw new AppError('Animal not found', 404);
  res.status(200).json({ success: true, data: animal });
});
