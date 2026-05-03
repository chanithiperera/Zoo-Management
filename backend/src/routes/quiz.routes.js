const express = require('express');
const {
  getAllQuizzesPublic,
  getQuizzesByAnimal,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} = require('../controllers/quiz.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');
const validateRequest = require('../validations/validateRequest');
const { createQuizRules, updateQuizRules, deleteQuizRules } = require('../validations/quiz.validation');
const { mongoAnimalIdParamRules } = require('../validations/common.params.validation');

const router = express.Router();
router.use(requireDatabase);
router.get('/', getAllQuizzesPublic);
router.get('/animal/:animalId', mongoAnimalIdParamRules, validateRequest, getQuizzesByAnimal);
router.post('/', protect, restrictTo('admin'), createQuizRules, validateRequest, createQuiz);
router.put('/:id', protect, restrictTo('admin'), updateQuizRules, validateRequest, updateQuiz);
router.delete('/:id', protect, restrictTo('admin'), deleteQuizRules, validateRequest, deleteQuiz);
module.exports = router;
