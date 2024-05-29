const mongoose = require('mongoose');

const { Schema } = mongoose;

// Definice schématu pro firmu (tenant)
const tenantSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
    unique: true,
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

// Middleware pro aktualizaci `updatedAt` před uložením
tenantSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;
