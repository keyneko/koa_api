const mongoose = require('mongoose')

const messageLogSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  topic: {
    type: String,
    required: true,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
  },
  qos: Number,
  isOnline: Boolean,
})

const MessageLog = mongoose.model('MessageLog', messageLogSchema)

module.exports = MessageLog
