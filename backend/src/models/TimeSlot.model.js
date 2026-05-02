const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: 'Photography'
    },
    date: {
      type: String, // Changed from Date to String for better compatibility with form inputs
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

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
