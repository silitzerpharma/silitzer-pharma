const mongoose = require("mongoose");
const { Schema } = mongoose;

const LeaveBalanceSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, unique: true },
  casual: { type: Number, default: 0 },
  sick: { type: Number, default: 0 },
  earned: { type: Number, default: 0 },
  unpaid:{ type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("LeaveBalance", LeaveBalanceSchema);
