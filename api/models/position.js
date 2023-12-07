const mongoose = require('mongoose')

// Define the schema for the 'positions' collection
const positionSchema = new mongoose.Schema({
  // Unique position code with specified format
  position: {
    type: String,
    unique: true,
    required: true,
  },
  // Name of the position
  name: {
    type: String,
    required: true,
  },
  // Status of the position: 0 (default), 1 (valid), 2 (invalid)
  status: {
    type: Number,
    enum: [0, 1, 2],
    default: 0,
  },
  // Flag indicating whether multiple items can be stacked in the same position: 0 (not allowed), 1 (allowed)
  isStackable: {
    type: Number,
    enum: [0, 1],
    default: 0,
  },
  options: {
    type: Object,
    default: {},
  },
  files: {
    type: [String],
    default: [],
  },
})

// Create the 'Position' model using the defined schema
const Position = mongoose.model('Position', positionSchema)

// Export the 'Position' model for use in other modules
module.exports = Position
