const express = require('express');
const {
  getDidYouKnowByAnimal,
  getAllDidYouKnow,
  createDidYouKnow,
  updateDidYouKnow,
  deleteDidYouKnow,
} = require('../controllers/didyouknow.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');
const validateRequest = require('../validations/validateRequest');
const {
  createDidYouKnowRules,
  updateDidYouKnowRules,
  deleteDidYouKnowRules,
} = require('../validations/didyouknow.validation');
const { mongoAnimalIdParamRules } = require('../validations/common.params.validation');

const router = express.Router();
router.use(requireDatabase);
router.get('/', getAllDidYouKnow);
router.get('/animal/:animalId', mongoAnimalIdParamRules, validateRequest, getDidYouKnowByAnimal);
router.post('/', protect, restrictTo('admin'), createDidYouKnowRules, validateRequest, createDidYouKnow);
router.put('/:id', protect, restrictTo('admin'), updateDidYouKnowRules, validateRequest, updateDidYouKnow);
router.delete('/:id', protect, restrictTo('admin'), deleteDidYouKnowRules, validateRequest, deleteDidYouKnow);
module.exports = router;
