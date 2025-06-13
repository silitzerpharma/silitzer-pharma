const mongoose = require('mongoose');
const { Schema } = mongoose;

const liveLocationSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  accuracy: { type: Number },
  timestamp: { type: Date, default: Date.now, index: { expires: '7d' } }, // auto delete after 7 days
  source: { type: String, enum: ['LiveTracking', 'Task'], default: 'LiveTracking' },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task' }
});

module.exports = mongoose.model('LiveLocation', liveLocationSchema);
