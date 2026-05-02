const express = require('express');
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/store.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');

const router = express.Router();

router.use(requireDatabase);

router
  .route('/')
  .get(getAllItems)
  .post(protect, restrictTo('admin'), createItem);

router
  .route('/:id')
  .get(getItemById)
  .put(protect, restrictTo('admin'), updateItem)
  .delete(protect, restrictTo('admin'), deleteItem);

module.exports = router;
