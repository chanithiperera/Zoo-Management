const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PhotographyBooking',
      required: false,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
      validate: {
        validator(url) {
          return /^https?:\/\/\S+$/i.test(url) || /^\/uploads\/\S+$/i.test(url);
        },
        message: 'Image URL must be a valid http/https URL or /uploads path',
      },
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [300, 'Caption cannot exceed 300 characters'],
      default: '',
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator(tagList) {
          return tagList.every((tag) => tag && tag.trim().length > 0 && tag.length <= 40);
        },
        message: 'Each tag must be non-empty and at most 40 characters long',
      },
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    bestMoment: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Photo', photoSchema);
