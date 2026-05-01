const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['article', 'video', 'activity', 'game', 'quiz'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
  },
});

const animalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: true,
    },
    habitat: {
      type: String,
      required: true,
    },
    diet: {
      type: String,
      required: true,
    },
    lifespan: {
      type: String,
      required: true,
      default: 'Unknown'
    },
    weight: {
      type: String,
      required: true,
      default: 'Unknown'
    },
    funFacts: {
      type: [String],
      default: [],
    },
    conservationStatus: {
      type: String,
      required: true,
      enum: ['Extinct', 'Extinct in the Wild', 'Critically Endangered', 'Endangered', 'Vulnerable', 'Near Threatened', 'Least Concern', 'Data Deficient'],
      default: 'Least Concern',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Animal', animalSchema);
