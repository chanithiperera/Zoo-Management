const mongoose = require('mongoose');
const Product = require('../models/Product.model');
const AppError = require('../utils/AppError');

const getAllCategories = async () => {
  const categories = [
    {
      _id: 'Souvenirs',
      name: 'Souvenirs',
      description: 'Take home a piece of the zoo with our unique souvenirs.',
      image: 'https://cdn.libemaweb.com/f/151320/da4e26a16e/zooparc-souvenirshop-wand-tafels-knuffels-bekers-souvenirs-scaled.jpg/m/3840x0/filters:fill(transparent):focal(778x775:779x776):quality(75)'
    },
    {
      _id: 'Merchandise',
      name: 'Merchandise',
      description: 'Apparel and accessories for all animal lovers.',
      image: 'https://africanwildlifevets.org/wp-content/uploads/2021/11/FC_20210218_0018-scaled.jpg'
    },
    {
      _id: 'Photography',
      name: 'Photography',
      description: 'Stunning prints and photography gear.',
      image: 'https://images.stockcake.com/public/6/1/4/61448229-a683-4e50-b6ac-b8026c465779_large/sunset-wildlife-photography-stockcake.jpg'
    },
    {
      _id: 'Toys',
      name: 'Toys',
      description: 'Plush animals and fun toys for the little ones.',
      image: 'https://i.ebayimg.com/images/g/saEAAOSwukxoJ2be/s-l1200.webp'
    },
    {
      _id: 'Books & Magazines',
      name: 'Books & Magazines',
      description: 'Educational books and interesting wildlife magazines.',
      image: 'https://www.alderneywildlife.org/sites/default/files/styles/large/public/2023-03/fotor_2023-3-15_13_47_45.jpg?itok=cthLfpWX'
    },
    {
      _id: 'Other',
      name: 'Other',
      description: 'Miscellaneous items for zoo lovers.',
      image: 'https://www.akronzoo.org/sites/default/files/styles/uncropped_xl/public/assets/basic/Gift%20Shop.jpg?itok=oSY1yYdN'
    }
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
  if (!id || !mongoose.Types.ObjectId.isValid(String(id))) {
    throw new AppError('Invalid product ID', 400);
  }
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('Product not found', 404);
  }
  return deleted;
};

const updateStock = async (productId, quantityChange, size = null) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  if (product.category === 'Merchandise' && size) {
    if (product.sizes && product.sizes[size] !== undefined) {
      product.sizes[size] += quantityChange;
      if (product.sizes[size] < 0) throw new Error(`Insufficient stock for product ${product.name} (Size: ${size})`);
    }
  } else {
    product.stock += quantityChange;
    if (product.stock < 0) throw new Error(`Insufficient stock for product ${product.name}`);
  }


  if (product.isModified('sizes')) {
    product.markModified('sizes');
  }

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
