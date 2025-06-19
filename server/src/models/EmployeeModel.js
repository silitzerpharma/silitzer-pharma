const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  EmployeeID: {
    type: String,
    required: true,
    unique: true
  },
  Name: {
    type: String,
  },
   profilePhotoUrl: { 
    type: String, 
   },
   imageFileId: { type: String, required: false },
  Email: {
    type: String,
  },
  PhoneNumber: {
    type: String,
  },
  Address: {
    type: String,
  },
  Position: {
    type: String,
  },
  IsActive: {
    type: Boolean,
    default: false
  },
  CurrentLogin: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'LoginSession',
  default: null,
},
  JoiningDate: {
    type: Date,
    default: Date.now,
  },
    liveLocation: {
    latitude: Number,
    longitude: Number,
    timestamp: Date,
  },
   isDeleted: {
    type: Boolean,
    default: false,
  },
  isBlock:{
   type: Boolean,
    default: false,
  },

}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
