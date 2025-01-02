const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Tenant ID
  tenantId: {
    type: String,
    ref: 'Tenant',
    required: [true, 'A priceList must belong to a tenant.'],
  },

  // Name
  name: {
    type: String,
    trim: true,
    required: [true, 'A employee must have a name.'],
    maxlength: [80, 'A employee must have less or equal than 80 characters.'],
  },
  // Description
  description: {
    type: String,
    trim: true,
    required: [true, 'An employee must have a description.'],
  },
  // Signature
  signature: {
    type: String,
    trim: true,
    maxlength: [80, 'A employee must have less or equal than 80 characters.'],
  },
  // Photo
  imageName: {
    type: String,
    trim: true,
  },
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
