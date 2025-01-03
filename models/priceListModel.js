const mongoose = require('mongoose');

const priceListSchema = new mongoose.Schema({
  // Tenant ID
  tenantId: {
    type: String,
    ref: 'Tenant',
    required: [true, 'A priceList must belong to a tenant.'],
  },
  order: { type: Number, default: 0 }, // Default order index, used when no value is explicitly provided

  // Title
  itemName: {
    type: String,
    trim: true,
    required: [true, 'A post must have a title.'],
    maxlength: [
      120,
      'A post title must have less or equal than 120 characters.',
    ],
    minlength: [5, 'A post title must have more or equal than 5 characters.'],
  },
  // Duration
  itemDuration: {
    type: String,
    trim: true,
  },
  // Description
  itemDescription: {
    type: String,
    trim: true,
    maxlength: [
      150,
      'A post title must have less or equal than 120 characters.',
    ],
    minlength: [5, 'A post title must have more or equal than 5 characters.'],
  },
  // Price
  itemPrice: {
    type: String,
    trim: true,
    required: [true, 'A post must have a price.'],
  },
});

const PriceList = mongoose.model('PriceList', priceListSchema);

module.exports = PriceList;
