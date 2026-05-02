const mongoose = require('mongoose');

const feedingSessionSchema = new mongoose.Schema(
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
      minlength: [5, 'Contact info must be at least 5 characters'],
      maxlength: [200, 'Contact info cannot exceed 200 characters'],
    },
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Animal is required'],
    },
    date: {
      type: Date,
      required: [true, 'Session date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)\s*-\s*([01]\d|2[0-3]):([0-5]\d)$/,
        'Time slot must be in HH:mm - HH:mm format',
      ],
    },
    numberOfParticipants: {
      type: Number,
      required: [true, 'Number of participants is required'],
      min: [1, 'Number of participants must be at least 1'],
      max: [500, 'Number of participants cannot exceed 500'],
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Max capacity is required'],
      min: [1, 'Max capacity must be at least 1'],
      max: [500, 'Max capacity cannot exceed 500'],
    },
  },
  { timestamps: true }
);

feedingSessionSchema.path('maxCapacity').validate(function validateCapacity(value) {
  return value >= this.numberOfParticipants;
}, 'Max capacity must be greater than or equal to number of participants');

feedingSessionSchema.path('numberOfParticipants').validate(function validateParticipants(value) {
  return value <= this.maxCapacity;
}, 'Number of participants must not exceed max capacity');

module.exports = mongoose.model('FeedingSession', feedingSessionSchema);
