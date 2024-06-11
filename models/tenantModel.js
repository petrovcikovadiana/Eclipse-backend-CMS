const mongoose = require('mongoose');

const { Schema } = mongoose;

// Definice schématu pro firmu (tenant)
const tenantSchema = new Schema(
  {
    name: {
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
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true, // Automaticky přidá `createdAt` a `updatedAt`
  },
);

// Indexes
tenantSchema.index({ domain: 1 }, { unique: true });

// Middleware pro aktualizaci `updatedAt` při `findOneAndUpdate` a `update`
tenantSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

tenantSchema.pre('update', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Virtuals
tenantSchema.virtual('userCount').get(function () {
  return this.users.length;
});

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;
