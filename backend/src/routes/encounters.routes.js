const express = require('express');
const {
  getAllEncounters,
  getEncounterById,
  createEncounter,
  updateEncounter,
  deleteEncounter,
} = require('../controllers/encounters.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');
const validateRequest = require('../validations/validateRequest');
const {
  createEncounterRules,
  updateEncounterRules,
  deleteEncounterRules,
  getEncounterByIdRules,
} = require('../validations/encounters.validation');

const router = express.Router();

router.use(requireDatabase);

router
  .route('/')
  .get(getAllEncounters)
  .post(protect, restrictTo('admin'), createEncounterRules, validateRequest, createEncounter);

router
  .route('/:id')
  .get(getEncounterByIdRules, validateRequest, getEncounterById)
  .put(protect, restrictTo('admin'), updateEncounterRules, validateRequest, updateEncounter)
  .delete(protect, restrictTo('admin'), deleteEncounterRules, validateRequest, deleteEncounter);

module.exports = router;
