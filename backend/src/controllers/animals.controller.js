const asyncHandler = require('../utils/asyncHandler');
const Animal = require('../models/Animal.model');

// @desc    Get all animals
// @route   GET /api/animals
// @access  Public
exports.getAllAnimals = asyncHandler(async (req, res) => {
  const { search, category } = req.query;

  let query = {};

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (category && category !== 'All') {
    query.category = category;
  }

  const animals = await Animal.find(query).sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: animals.length,
    data: animals,
  });
});

// @desc    Get single animal
// @route   GET /api/animals/:id
// @access  Public
exports.getAnimalById = asyncHandler(async (req, res) => {
  const animal = await Animal.findById(req.params.id);

  if (!animal) {
    return res.status(404).json({
      success: false,
      message: 'Animal not found',
    });
  }

  res.status(200).json({
    success: true,
    data: animal,
  });
});

// @desc    Create animal
// @route   POST /api/animals
// @access  Private/Admin
exports.createAnimal = asyncHandler(async (req, res) => {
  const animal = await Animal.create(req.body);

  res.status(201).json({
    success: true,
    data: animal,
  });
});

// @desc    Update animal
// @route   PUT /api/animals/:id
// @access  Private/Admin
exports.updateAnimal = asyncHandler(async (req, res) => {
  let animal = await Animal.findById(req.params.id);

  if (!animal) {
    return res.status(404).json({
      success: false,
      message: 'Animal not found',
    });
  }

  animal = await Animal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: animal,
  });
});

// @desc    Delete animal
// @route   DELETE /api/animals/:id
// @access  Private/Admin
exports.deleteAnimal = asyncHandler(async (req, res) => {
  const animal = await Animal.findById(req.params.id);

  if (!animal) {
    return res.status(404).json({
      success: false,
      message: 'Animal not found',
    });
  }

  await animal.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
