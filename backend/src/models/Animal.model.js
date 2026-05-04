const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    species: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      default: 0,
    },
    feedingSchedule: {
      type: String,
      default: 'Standard',
    },
    isAvailableForPhotography: {
      type: Boolean,
      default: true,
    },
    healthStatus: {
      type: String,
      default: 'healthy',
    },
    feedingRestrictions: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Animal', animalSchema);
