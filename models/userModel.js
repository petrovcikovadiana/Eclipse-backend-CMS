const mongoose = require('mongoose');

const { Schema } = mongoose;

// Definice schématu pro uživatele
const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'error_registration_username'],
  },
  email: {
    type: String,
    required: [true, 'error_registration_email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'error_registration_password_minlength'],
  },
  passwordConfirm: {
    type: String,
    required: true,
    minlength: [8, 'error_registration_password_minlength'],
    validate: {
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
  updatedAt: {
    type: Date,
  },
});

// Middleware pro aktualizaci `updatedAt` před uložením
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
