const mongoose = require('mongoose');
const { Schema } = mongoose;

const StatusHistorySchema = new Schema({
  status: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
});

const TaskSchema = new Schema({
  taskId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  status: {
    type: String,
    required: true,
    enum: ['Assigned', 'Scheduled', 'Ongoing', 'Complete', 'Pending', 'Overdue','Cancelled'],
  },
  statusHistory: [StatusHistorySchema],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  address: { type: String },
  notes: { type: String },

  assignDate: { type: Date, default: Date.now },
  startDate: { type: Date, default: Date.now },
  dueDate: { type: Date },

  completionDate: { type: Date },
  completionLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
}, { timestamps: true }); // ✅ This enables createdAt and updatedAt fields

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;
