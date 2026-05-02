const mongoose = require('mongoose');

const photographyBookingSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      required: [true, 'Visitor name is required'],
      trim: true,
      minlength: [2, 'Visitor name must be at least 2 characters'],
      maxlength: [120, 'Visitor name cannot exceed 120 characters'],
    },
    contactInfo: {
      type: String,
      required: [true, 'Contact info is required'],
      trim: true,
      minlength: [3, 'Contact info must be at least 3 characters'],
      maxlength: [200, 'Contact info cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    time: {
      type: String,
      required: [true, 'Booking time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'],
    },
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Animal is required'],
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PhotographyPackage',
      required: false,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [15, 'Duration must be at least 15 minutes'],
      max: [1440, 'Duration cannot exceed 1440 minutes'],
    },
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photographer',
      required: [true, 'Photographer is required'],
    },
    timeSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeSlot',
      required: [true, 'Time slot is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['booked', 'completed', 'cancelled'],
        message: 'Status must be one of: booked, completed, cancelled',
      },
      default: 'booked',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PhotographyBooking', photographyBookingSchema);
