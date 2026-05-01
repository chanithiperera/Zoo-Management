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
