const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  value: {
    type: String,
    unique: true,
    required: true,
  },
  isProtected: {
    type: Boolean,
  },
  isAdmin: {
    type: Boolean,
  },
  // Status: 0 (invalid), 1 (valid)
  status: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
  sops: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  permissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission',
    },
  ],
  translations: {
    type: Map, // Map type for storing translations
    of: String, // String values for translations
  },
})

const Role = mongoose.model('Role', roleSchema)

module.exports = Role
