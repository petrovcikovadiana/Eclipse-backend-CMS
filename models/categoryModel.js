const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  tenantId: {
    type: String,
    ref: 'Tenant',
    required: [true, 'A category must belong to a tenant.'],
  },
  order: { type: Number, default: 0 }, // Array for order

  // Name
  title: {
    type: String,
    trim: true,
    required: [true, 'A category must have a title.'],
  },

  // Slug for URL
  slug: {
    type: String,
    trim: true,
    required: [true, 'A category must have a slug.'],
  },

  // Icon
  icon: {
    type: String,
    trim: true,
    required: [true, 'A category must have an icon.'],
  },

  // Tenant IDs that have access to this category
  tenantIds: [
    {
      type: String,
      required: true,
    },
  ],
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
