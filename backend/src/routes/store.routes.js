const express = require('express');
const storeController = require('../controllers/store.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { createUpload } = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/categories', storeController.getAllCategories);
router.post('/categories', protect, restrictTo('admin'), storeController.createCategory);
router.put('/categories/:id', protect, restrictTo('admin'), storeController.updateCategory);
router.delete('/categories/:id', protect, restrictTo('admin'), storeController.deleteCategory);

router.get('/products', storeController.getAllProducts);
router.get('/products/:id', storeController.getProductById);
router.post('/products', protect, restrictTo('admin'), createUpload('products').single('image'), storeController.createProduct);
router.put('/products/:id', protect, restrictTo('admin'), createUpload('products').single('image'), storeController.updateProduct);
router.delete('/products/:id', protect, restrictTo('admin'), storeController.deleteProduct);

module.exports = router;
