const mongoose = require('mongoose');

const encounterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      default: null,
    },
    animalName: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // minutes
      required: true,
      min: 1,
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    photographyIncluded: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Encounter', encounterSchema);
