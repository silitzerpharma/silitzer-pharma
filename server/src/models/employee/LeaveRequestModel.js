const mongoose = require("mongoose");
const { Schema } = mongoose;

const LeaveRequestSchema = new Schema({
  requestId: { type: String, required: true, unique: true }, // Custom request ID like LR001
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  leaveType: { type: String, enum: ["Casual", "Sick", "Unpaid","Earned"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  appliedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  rejectionReason: { type: String },
  isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("LeaveRequest", LeaveRequestSchema);
