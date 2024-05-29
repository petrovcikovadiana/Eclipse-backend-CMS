const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

// Define the schema for users
const userSchema = new Schema({
  userName: {
    type: String,
    required: [true, 'error_registration_userName'],
  },
  email: {
    type: String,
    required: [true, 'error_registration_email'],
    unique: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['user', 'manager', 'admin', 'super-admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'error_registration_password_minlength'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    minlength: [8, 'error_registration_password_minlength'],
    validate: {
      // This only works on Create and Save
      validator: function (el) {
        return el === this.password;
      },
      message: 'error_registration_password_match',
    },
  },
  tenants: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  passwordChangedAt: Date,
  updatedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// Middleware to hash the password before saving
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with bcryptjs
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Middleware to update `updatedAt` before saving
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  //false = not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
