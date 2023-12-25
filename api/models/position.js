const mongoose = require('mongoose')

// Define the schema for the 'positions' collection
const positionSchema = new mongoose.Schema({
  // Unique position code with specified format
  value: {
    type: String,
    unique: true,
    required: true,
  },
  // Name of the position
  name: {
    type: String,
  },
  // Flag indicating whether multiple items can be stacked in the same position: 0 (not allowed), 1 (allowed)
  isStackable: {
    type: Number,
    enum: [0, 1],
    default: 0,
  },
  // Status: 0 (invalid), 1 (valid)
  status: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
  isProtected: {
    type: Boolean,
  },
  options: {
    type: Object,
    default: {},
  },
  files: {
    type: [String],
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

// Create the 'Position' model using the defined schema
const Position = mongoose.model('Position', positionSchema)

// Export the 'Position' model for use in other modules
module.exports = Position
