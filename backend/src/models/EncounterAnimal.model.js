const mongoose = require('mongoose');

const encounterAnimalSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: true,
      enum: ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish', 'Insect'],
    },
    age: {
      type: Number,
      default: 0,
    },
    feedingSchedule: {
      type: String,
      default: 'Standard',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '/uploads/animals/default.jpg',
    },
    type: {
      type: String,
      default: 'animal',
      enum: ['animal'],
    },
    healthStatus: {
      type: String,
      default: 'healthy',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EncounterAnimal', encounterAnimalSchema, 'encounters');
