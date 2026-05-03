const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Quiz = require('../models/Quiz.model');

/** Public: all quiz questions with animal info (for visitor Education hub). */
exports.getAllQuizzesPublic = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find()
    .populate('animal', 'name species imageUrl category')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
});

exports.getQuizzesByAnimal = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ animal: req.params.animalId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
});

exports.createQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.create(req.body);
  res.status(201).json({ success: true, data: quiz });
});

exports.updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!quiz) throw new AppError('Quiz not found', 404);
  res.status(200).json({ success: true, data: quiz });
});

exports.deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findByIdAndDelete(req.params.id);
  if (!quiz) throw new AppError('Quiz not found', 404);
  res.status(200).json({ success: true, data: {} });
});
