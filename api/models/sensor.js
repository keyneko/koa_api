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
  isOnline: {
    type: Boolean,
    default: false,
  },
  isProtected: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  subscriptions: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  translations: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
})

const Sensor = mongoose.model('Sensor', sensorSchema)

module.exports = Sensor
