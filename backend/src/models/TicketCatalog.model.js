const mongoose = require('mongoose');

const ticketCatalogSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Catalog code is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Catalog name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['entry', 'show'],
      required: [true, 'Catalog category is required'],
    },
    priceLkr: {
      type: Number,
      required: [true, 'Catalog price is required'],
      min: [0, 'Catalog price must be 0 or greater'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    dailyCapacity: {
      type: Number,
      min: [1, 'Daily capacity must be at least 1'],
      default: null,
      validate: {
        validator(value) {
          if (this.category !== 'show') return value == null;
          return Number.isInteger(value) && value > 0;
        },
        message: 'Show daily capacity must be a positive integer',
      },
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TicketCatalog', ticketCatalogSchema);
