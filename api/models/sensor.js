const mongoose = require('mongoose')

const sensorSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  number: {
    type: String,
    unique: true,
  },
  type: {
    type: Number,
  },
  manufacturer: {
    type: String,
  },
  // Status: 0 (invalid), 1 (valid)
  status: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
  translations: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
})

const Sensor = mongoose.model('Sensor', sensorSchema)

module.exports = Sensor
