const mongoose = require('mongoose');

const storeItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ['souvenir', 'clothing', 'food', 'toy', 'book', 'other'],
      default: 'other',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StoreItem', storeItemSchema);
