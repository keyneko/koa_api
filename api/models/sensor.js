const mongoose = require('mongoose')

const sensorSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  number: {
    type: String,
  },
  type: {
    type: Number,
  },
  manufacturer: {
    type: String,
  },
  isProtected: {
    type: Boolean,
  },
  apiKey: {
    type: String,
    unique: true,
  },
  // Status: 0 (invalid), 1 (valid)
  status: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
  online: {
    type: Boolean,
  },
  translations: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
})

const Sensor = mongoose.model('Sensor', sensorSchema)

module.exports = Sensor
