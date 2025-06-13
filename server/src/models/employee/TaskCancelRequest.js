const mongoose = require('mongoose');
const { Schema } = mongoose;

const TaskCancelRequestSchema = new Schema({
  requestId: { type: String, required: true, unique: true },
  taskId: { type: String, required: true, ref: 'Task' },
  employeeId: { type: String, required: true, ref: 'Employee' },
  reason: { type: String }, // Optional: reason for cancellation
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  requestedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: String, ref: 'Admin' }, // who reviewed the request
});

module.exports = mongoose.model('TaskCancelRequest', TaskCancelRequestSchema);
