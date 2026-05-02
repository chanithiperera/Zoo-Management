const asyncHandler = require('../utils/asyncHandler');
const storeService = require('../services/store.service');

exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await storeService.getAllCategories();
  res.status(200).json({ success: true, data: categories });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await storeService.createCategory(req.body);
  res.status(201).json({ success: true, data: category });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await storeService.updateCategory(req.params.id, req.body);
  res.status(200).json({ success: true, data: category });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  await storeService.deleteCategory(req.params.id);
  res.status(200).json({ success: true, message: 'Category deleted successfully' });
});

exports.getAllProducts = asyncHandler(async (req, res) => {
  const products = await storeService.getAllProducts(req.query);
  res.status(200).json({ success: true, data: products });
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await storeService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.status(200).json({ success: true, data: product });
});

exports.createProduct = asyncHandler(async (req, res) => {
  if (req.file) {
    const imageUrl = `/uploads/products/${req.file.filename}`;
    req.body.images = [imageUrl];
  } else if (req.body.images && typeof req.body.images === 'string') {
    req.body.images = req.body.images ? [req.body.images] : [];
  }
  if (req.body.sizes && typeof req.body.sizes === 'string') {
    try {
      req.body.sizes = JSON.parse(req.body.sizes);
    } catch (e) {
      console.error('Failed to parse sizes', e);
    }
  }
  const product = await storeService.createProduct(req.body);
  res.status(201).json({ success: true, data: product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  if (req.file) {
    const imageUrl = `/uploads/products/${req.file.filename}`;
    req.body.images = [imageUrl];
  } else if (req.body.images && typeof req.body.images === 'string') {
    req.body.images = req.body.images ? [req.body.images] : [];
  }
  if (req.body.sizes && typeof req.body.sizes === 'string') {
    try {
      req.body.sizes = JSON.parse(req.body.sizes);
    } catch (e) {
      console.error('Failed to parse sizes', e);
    }
  }
  const product = await storeService.updateProduct(req.params.id, req.body);
  res.status(200).json({ success: true, data: product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  await storeService.deleteProduct(req.params.id);
  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});
