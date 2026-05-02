const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['entry', 'show'],
    },
    title: {
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
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    showTime: {
      type: Date,
      default: null,
    },
    availableFrom: {
      type: Date,
      required: true,
    },
    availableTo: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
