// Importing Mongoose to interact with MongoDB
const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  config_key: {
    type: String,
    required: [true, 'A config key must be set'],
  },
  config_value: {
    type: Object,
    required: [true, 'A config value must be set'],
  },
});

const Config = mongoose.model('Config', configSchema);

// Exporting the model for use in the application
module.exports = Config;
