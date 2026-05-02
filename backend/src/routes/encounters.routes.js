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

const router = express.Router();

router.use(requireDatabase);

router
  .route('/')
  .get(getAllEncounters)
  .post(protect, restrictTo('admin'), createEncounter);

router
  .route('/:id')
  .get(getEncounterById)
  .put(protect, restrictTo('admin'), updateEncounter)
  .delete(protect, restrictTo('admin'), deleteEncounter);

module.exports = router;
