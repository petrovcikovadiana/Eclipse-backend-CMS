const mongoose = require('mongoose');

// Define schema for configurations
const configSchema = new mongoose.Schema({
  config_key: {
    type: String,
    required: [true, 'A config key must be set'],
  },
  config_value: {
    type: Object,
    required: [true, 'A config value must be set'],
  },
  tenant: {
    type: String, // Use String for tenantId
    ref: 'Tenant',
    required: [true, 'A post must belong to a tenant.'],
  },
});

const Config = mongoose.model('Config', configSchema);

module.exports = Config;
