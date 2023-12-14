const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  avatar: {
    type: String,
  },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
    },
  ],
  denyPermissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission',
    },
  ],
  // Status: 0 (invalid), 1 (valid)
  status: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
  translations: {
    type: Map, // Map type for storing translations
    of: String, // String values for translations
  },
})

const User = mongoose.model('User', userSchema)

module.exports = User
