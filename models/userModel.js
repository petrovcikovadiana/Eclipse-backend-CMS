const crypto = require('crypto'); // Node.js module for cryptographic functionality
const mongoose = require('mongoose'); // MongoDB object modeling tool
const bcrypt = require('bcryptjs'); // Library for hashing passwords

const { Schema } = mongoose;

// Define the schema for users
const userSchema = new Schema({
  userName: {
    type: String,
    required: [
      function () {
        return !this.isInvite;
      },
      'error_registration_userName', 
    ],
  },
  email: {
    type: String,
    required: [true, 'error_registration_email'], 
    unique: true, 
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['user', 'editor', 'manager', 'admin', 'super-admin'], 
    default: 'user', 
  },
  password: {
    type: String,
    required: [
      function () {
        return !this.isInvite;
      },
      'Path `password` is required.', 
    ],
    minlength: [8, 'error_registration_password_minlength'], 
    select: false, // Password will not be returned in queries by default
  },
  passwordConfirm: {
    type: String,
    required: [
      function () {
        return !this.isInvite;
      },
      'Path `passwordConfirm` is required.',
    ],
    minlength: [8, 'error_registration_password_minlength'], 
    validate: {
      validator: function (el) {
        return el === this.password; // Ensure passwords match
      },
      message: 'error_registration_password_match', 
    },
  },
  tenantId: [
    {
      type: String,
      ref: 'Tenant', // Reference to the Tenant model
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set creation date
  },
  passwordChangedAt: Date,
  updatedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true, // Default to active
    select: false, // Not included in query results by default
  },
  isInvite: {
    type: Boolean,
    default: false, // Indicates if the user is created via invitation
  },
});

// Hash the password before saving if it was modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isInvite) return next();

  this.password = await bcrypt.hash(this.password, 12); // Hash the password
  this.passwordConfirm = undefined; // Remove confirmation field

  next();
});

// Exclude inactive users from queries
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Update `passwordChangedAt` if the password was changed
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew || this.isInvite) return next();
  this.passwordChangedAt = Date.now() - 1000; // Ensure timestamp is before token creation
  next();
});

// Update `updatedAt` before saving
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if the provided password matches the stored password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if the password was changed after a specific timestamp
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate a password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); // Store the hashed version of the token

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

  return resetToken; // Return the plain reset token
};

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User; 
