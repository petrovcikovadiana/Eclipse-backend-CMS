const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  imageName: {
    type: String,
    required: [true, 'Image name is required.'],
  },
  tenantId: { type: String, required: true },
});

const gallerySchema = new mongoose.Schema({
  tenantId: {
    type: String,
    ref: 'Tenant',
    required: [true, 'A gallery must belong to a tenant.'],
  },
  photos: [photoSchema],
});

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;
