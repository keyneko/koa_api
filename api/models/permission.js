const mongoose = require('mongoose')

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  pattern: {
    type: String,
    required: true,
    unique: true,
  },
  // Status of the dictionary: 0 (invalid), 1 (valid)
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

const Permission = mongoose.model('Permission', permissionSchema)

module.exports = Permission
