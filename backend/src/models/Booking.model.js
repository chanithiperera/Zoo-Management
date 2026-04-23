const mongoose = require('mongoose');

const bookingItemSchema = new mongoose.Schema(
  {
    itemCode: {
      type: String,
      required: true,
      trim: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPriceLkr: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotalLkr: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const paymentSnapshotSchema = new mongoose.Schema(
  {
    cardholderName: {
      type: String,
      required: true,
      trim: true,
    },
    cardLast4: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 4,
    },
    method: {
      type: String,
      default: 'card',
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    visitDate: {
      type: String,
      required: true,
      trim: true,
    },
    entryItems: {
      type: [bookingItemSchema],
      default: [],
    },
    showItems: {
      type: [bookingItemSchema],
      default: [],
    },
    entrySubtotalLkr: {
      type: Number,
      required: true,
      min: 0,
    },
    showsSubtotalLkr: {
      type: Number,
      required: true,
      min: 0,
    },
    totalLkr: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'failed'],
      default: 'paid',
    },
    payment: {
      type: paymentSnapshotSchema,
      required: true,
    },
    confirmationCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'ticketbookings',
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
