const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: String,
  accessLevel: String,
  permissions: [String],
});

module.exports = mongoose.model('Admin', adminSchema);
