const mongoose = require('mongoose');

const sensorRecordSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sensorId: {
    type: String,
    required: true,
  },
  sensorName: {
    type: String,
  },
  value: {
    type: Number,
  },
  options: {
    type: Object,
    default: {},
  },
});

const SensorRecord = mongoose.model('SensorRecord', sensorRecordSchema);

module.exports = SensorRecord;
