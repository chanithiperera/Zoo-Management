const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    // Match the user's example exactly, plus our new fields
    type: {
      type: String,
      default: 'Photography'
    },
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    isBooked: {
      type: Boolean,
      default: false
    },
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photographer',
      // Allow null for feeding slots
      default: null
    },
    capacity: {
      type: Number,
      default: 5
    },
    animalName: {
      type: String,
      default: 'All'
    }
  },
  { timestamps: true }
);

// Remove any complex pre-save hooks or indexes for now
module.exports = mongoose.model('TimeSlot', timeSlotSchema);
