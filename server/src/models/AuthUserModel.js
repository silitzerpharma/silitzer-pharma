const mongoose = require('mongoose');

const authUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ['admin', 'employee', 'distributor'],
    required: true,
  },

  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'roleModel',
  },

  roleModel: {
    type: String,
    required: true,
    enum: ['Admin', 'Employee', 'Distributor'],
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },

  isBlock: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('AuthUser', authUserSchema);
