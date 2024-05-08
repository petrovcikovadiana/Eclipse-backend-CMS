// Import the configuration model
const Config = require('../models/configModel');

// Retrieve all configurations based on query parameters
exports.getAllConfigs = async (req, res) => {
  try {
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
  } catch (err) {
    // Handle errors and respond with an error message
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Retrieve a specific configuration by key
exports.getConfig = async (req, res) => {
  try {
    // Find the configuration by its key
    const config = await Config.findOne({ config_key: req.params.config_key });
    // Check if the configuration exists
    if (!config) {
      return res.status(404).json({
        status: 'fail',
        message: 'Configuration not found',
      });
    }
    // Respond with the configuration
    res.status(200).json({
      status: 'success',
      data: {
        config,
      },
    });
  } catch (err) {
    // Handle errors and respond with an error message
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Create a new configuration
exports.createConfig = async (req, res) => {
  try {
    // Create a new configuration with the provided data
    const newConfig = await Config.create(req.body);
    // Respond with the newly created configuration
    res.status(201).json({
      status: 'success',
      data: {
        configs: newConfig,
      },
    });
  } catch (err) {
    // Handle errors and respond with an error message
    res.status(400).json({
      status: 'fail',
      message: `Invalid data sent: ${err.message}`,
    });
  }
};

// Update an existing configuration
exports.updateConfig = async (req, res) => {
  try {
    // Find and update the configuration by its key
    const config = await Config.findOneAndUpdate(
      { config_key: req.params.config_key },
      req.body,
      { new: true }, // Return the updated document
    );

    // Respond with the updated configuration
    res.status(200).json({
      status: 'success',
      data: {
        config,
      },
    });
  } catch (err) {
    // Handle errors and respond with an error message
    res.status(400).json({
      status: 'fail',
      message: `Invalid data sent: ${err.message}`,
    });
  }
};

// Delete a configuration
exports.deleteConfig = async (req, res) => {
  try {
    // Find and delete the configuration by its key
    const config = await Config.findOneAndDelete({
      config_key: req.params.config_key,
    });

    // Check if the configuration was found
    if (!config) {
      return res.status(404).json({
        status: 'fail',
        message: 'Configuration not found',
      });
    }

    // Respond with a success status
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    // Handle errors and respond with an error message
    res.status(400).json({
      status: 'fail',
      message: `Invalid data sent: ${err.message}`,
    });
  }
};
