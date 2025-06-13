const mongoose = require('mongoose');
const { Schema } = mongoose;

const loginSessionSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },

  loginTime: { type: Date, default: Date.now },
  logoutTime: { type: Date },

  loginLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },

  logoutLocation: {
    latitude: { type: Number },
    longitude: { type: Number }
  },

  deviceInfo: { type: String },
  ipAddress: { type: String },
  sessionId: { type: String }, // optional for session tracking

}, { timestamps: true });

module.exports = mongoose.model('LoginSession', loginSessionSchema);
