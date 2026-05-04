const mongoose = require('mongoose');

const supportingDocumentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    storedPath: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const groupBookingRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    groupType: {
      type: String,
      enum: ['school', 'tourist', 'other'],
      required: true,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    visitDate: {
      type: String,
      required: true,
      trim: true,
    },
    totalPeople: {
      type: Number,
      required: true,
      min: 20,
    },
    adultsCount: {
      type: Number,
      required: true,
      min: 0,
    },
    childrenCount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    supportingDocument: {
      type: supportingDocumentSchema,
      required: false,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
      index: true,
    },
    reviewNotes: {
      type: String,
      default: '',
      trim: true,
    },
    requestCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'groupbookingrequests',
  }
);

module.exports = mongoose.model('GroupBookingRequest', groupBookingRequestSchema);
