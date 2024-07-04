const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  tenantId: {
    type: String, // Use String for tenantId
    ref: 'Tenant',
    required: [true, 'A post must belong to a tenant.'],
  },
  title: {
    type: String,
    trim: true,
    required: [true, 'A post must have a title.'],
    maxlength: [80, 'A post title must have less or equal than 80 characters.'],
    minlength: [5, 'A post title must have more or equal than 5 characters.'],
  },
  slug: {
    type: String,
    trim: true,
    required: [true, 'A post must have a slug.'],
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'A post must have a description.'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  imageName: {
    type: String,
    trim: true,
  },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
