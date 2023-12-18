const mongoose = require('mongoose')

const sensorRecordSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  options: {
    type: Object,
    default: {},
  },
})

const SensorRecord = mongoose.model('SensorRecord', sensorRecordSchema)

module.exports = SensorRecord
