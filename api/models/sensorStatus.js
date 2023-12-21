const mongoose = require('mongoose')

const sensorStatusSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: mongoose.Schema.Types.Mixed,
  },
})

const SensorStatus = mongoose.model('SensorStatus', sensorStatusSchema)

module.exports = SensorStatus
