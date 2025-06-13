const mongoose = require('mongoose');

const distributorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    unique: false,
  },
  distributorId:{
     type: String,
     required: true,
     unique: true,
  },
  gst_number: {
    type: String,
    required: false,
    unique: false,
  },
  email: {
    type: String,
    required: false,
    unique: false,
  },
  phone_number: {
    type: String,
    required: false,
    unique: false,
  },
  address: {
    type: String,
    required: false,
    unique: false,
  },
  date_registered: {
    type: Date,
    default: Date.now,
    required: false,
    unique: false,
  },
  drug_license_number: {
    type: String,
    required: false,
    unique: false,
  },

  // Soft delete flag
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isBlock:{
   type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model('Distributor', distributorSchema);
