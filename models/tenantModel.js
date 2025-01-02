const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;

// Function to generate unique 16-character ID
const generateUniqueTenantId = async () => {
  let tenantId;
  let tenant;
  do {
    tenantId = crypto.randomBytes(8).toString('hex'); // Generate 16 hex characters
    tenant = await mongoose.models.Tenant.findOne({ tenantId });
  } while (tenant);
  return tenantId;
};

// Define schema for tenant
const tenantSchema = new Schema(
  {
    tenantId: {
      type: String,
      unique: true,
    },
    tenantName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      unique: true,
      trim: true,
      match: [/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please fill a valid domain'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt`
  },
);

// Middleware to generate unique 8-character ID before saving
tenantSchema.pre('save', async function (next) {
  if (!this.tenantId) {
    this.tenantId = await generateUniqueTenantId();
  }
  next();
});

// Indexes
// tenantSchema.index({ domain: 1 }, { unique: true });
// tenantSchema.index({ tenantId: 1 }, { unique: true });

// Middleware to update `updatedAt` on `findOneAndUpdate` and `update`
tenantSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

tenantSchema.pre('update', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Virtual property to get the user count
tenantSchema.virtual('userCount').get(function () {
  return this.users.length;
});

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;
