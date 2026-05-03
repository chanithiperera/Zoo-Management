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
const router = express.Router();
router.use(requireDatabase);
router.get('/', getAllQuizzesPublic);
router.get('/animal/:animalId', getQuizzesByAnimal);
router.post('/', protect, restrictTo('admin'), createQuiz);
router.put('/:id', protect, restrictTo('admin'), updateQuiz);
router.delete('/:id', protect, restrictTo('admin'), deleteQuiz);
module.exports = router;
