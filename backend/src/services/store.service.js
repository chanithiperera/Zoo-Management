const Product = require('../models/Product.model');

/**
 * Category Services 
 * Using a fixed list of categories as requested by the user.
 */
const getAllCategories = async () => {
  const categories = [
    { _id: 'Souvenirs', name: 'Souvenirs' },
    { _id: 'Merchandise', name: 'Merchandise' },
    { _id: 'Photography', name: 'Photography' },
    { _id: 'Toys', name: 'Toys' },
    { _id: 'Books & Magazines', name: 'Books & Magazines' }
  ];
  
  return categories;
};

// Placeholder functions to prevent errors if called
const createCategory = async () => ({ success: true });
const updateCategory = async () => ({ success: true });
const deleteCategory = async () => ({ success: true });

/**
 * Product Services
 */
const getAllProducts = async (filters = {}) => {
  const query = {};
  if (filters.category) query.category = filters.category;
  if (filters.isAvailable !== undefined) query.isAvailable = filters.isAvailable;
  
  return await Product.find(query);
};

const getProductById = async (id) => {
  return await Product.findById(id);
};

const createProduct = async (productData) => {
  return await Product.create(productData);
};

const updateProduct = async (id, productData) => {
  return await Product.findByIdAndUpdate(id, productData, { new: true, runValidators: true });
};

const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};

const updateStock = async (productId, quantityChange) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');
  
  product.stock += quantityChange;
  if (product.stock < 0) throw new Error(`Insufficient stock for product ${product.name}`);
  
  return await product.save();
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
};
