const mongoose = require('mongoose');

// Define schema for configurations
const configSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'A config must belong to a tenant.'],
  },
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

module.exports = Config;
