const mongoose = require('mongoose');

const photographyPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
      minlength: [2, 'Package name must be at least 2 characters'],
      maxlength: [120, 'Package name cannot exceed 120 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [15, 'Duration must be at least 15 minutes'],
      max: [1440, 'Duration cannot exceed 1440 minutes'],
    },
    photoCount: {
      type: Number,
      required: [true, 'Photo count is required'],
      min: [1, 'Photo count must be at least 1'],
      max: [1000, 'Photo count cannot exceed 1000'],
    },
    animalsIncluded: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Animal',
        },
      ],
      required: [true, 'At least one animal must be included'],
      validate: {
        validator(animals) {
          return Array.isArray(animals) && animals.length > 0;
        },
        message: 'At least one animal must be included',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      max: [1000000, 'Price cannot exceed 1000000'],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PhotographyPackage', photographyPackageSchema);
