const asyncHandler = require('../utils/asyncHandler');
const Education = require('../models/Education.model');

// @desc    Create education content
// @route   POST /api/education
// @access  Private/Admin
exports.createEducation = asyncHandler(async (req, res) => {
  const education = await Education.create(req.body);

  res.status(201).json({
    success: true,
    data: education,
  });
});

// @desc    Get all education content
// @route   GET /api/education
// @access  Public
exports.getAllEducation = asyncHandler(async (req, res) => {
  const education = await Education.find().populate('animal', 'name species');

  res.status(200).json({
    success: true,
    count: education.length,
    data: education,
  });
});

// @desc    Get education content by animal
// @route   GET /api/education/animal/:animalId
// @access  Public
exports.getEducationByAnimal = asyncHandler(async (req, res) => {
  const education = await Education.find({ animal: req.params.animalId });

  res.status(200).json({
    success: true,
    count: education.length,
    data: education,
  });
});

// @desc    Update education content
// @route   PUT /api/education/:id
// @access  Private/Admin
exports.updateEducation = asyncHandler(async (req, res) => {
  let education = await Education.findById(req.params.id);

  if (!education) {
    return res.status(404).json({
      success: false,
      message: 'Education content not found',
    });
  }

  education = await Education.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: education,
  });
});

// @desc    Delete education content
// @route   DELETE /api/education/:id
// @access  Private/Admin
exports.deleteEducation = asyncHandler(async (req, res) => {
  const education = await Education.findById(req.params.id);

  if (!education) {
    return res.status(404).json({
      success: false,
      message: 'Education content not found',
    });
  }

  await education.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
