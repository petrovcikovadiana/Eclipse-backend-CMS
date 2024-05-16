// Importing Mongoose for MongoDB interaction
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true, // Removes leading/trailing spaces
    required: [true, 'A post must have a title.'], // Validator
  },
  slug: {
    type: String,
    trim: true, // Removes leading/trailing spaces
    required: [true, 'A post must have a slug.'], // Validator
  },
  description: {
    type: String,
    trim: true, // Removes leading/trailing spaces
    required: [true, 'A post must have a description.'], // Validator
  },
  date: {
    type: Date,
    default: Date.now, // Uses JavaScript's Date.now() for the current date/time
  },
  imageName: {
    type: String,
    trim: true, // Removes leading/trailing spaces
  },
});

const Post = mongoose.model('Post', postSchema);

// Exporting the model for use in the application
module.exports = Post;
