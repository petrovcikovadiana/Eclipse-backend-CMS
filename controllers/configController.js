// Import the configuration model
const Config = require('../models/configModel');
const catchAsync = require('../utils/catchAsync');
const handleNotFound = require('../utils/handleNotFound');

// Retrieve all configurations based on query parameters
exports.getAllConfigs = catchAsync(async (req, res, next) => {
  // Clone the request query to avoid mutating the original object
  const queryObj = { ...req.query };
  // Find all configurations matching the query
  const configs = await Config.find(queryObj);

  // Respond with the configurations
  res.status(200).json({
    status: 'success',
    results: configs.length,
    data: {
      configs,
    },
  });
});

// Retrieve a specific configuration by key
exports.getConfig = catchAsync(async (req, res, next) => {
  // Find the configuration by its key
  const config = await Config.findOne({ config_key: req.params.config_key });
  handleNotFound(config, 'Configuration');

  // Respond with the configuration
  res.status(200).json({
    status: 'success',
    data: {
      config,
    },
  });
});

// Create a new configuration
exports.createConfig = catchAsync(async (req, res, next) => {
  // Create a new configuration with the provided data
  const newConfig = await Config.create(req.body);
  // Respond with the newly created configuration
  res.status(201).json({
    status: 'success',
    data: {
      config: newConfig,
    },
  });
});

// Update an existing configuration
exports.updateConfig = catchAsync(async (req, res, next) => {
  // Find and update the configuration by its key
  const config = await Config.findOneAndUpdate(
    { config_key: req.params.config_key },
    req.body,
    { new: true }, // Return the updated document
  );
  handleNotFound(config, 'Configuration');

  // Respond with the updated configuration
  res.status(200).json({
    status: 'success',
    data: {
      config,
    },
  });
});

// Delete a configuration
exports.deleteConfig = catchAsync(async (req, res, next) => {
  // Find and delete the configuration by its key
  const config = await Config.findOneAndDelete({
    config_key: req.params.config_key,
  });
  handleNotFound(config, 'Configuration');

  // Respond with a success status
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
