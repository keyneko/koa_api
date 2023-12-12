const mongoose = require('mongoose')

const dictionarySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Accepts Number or String
    required: true,
  },
  name: {
    type: String,
  },
  // Status of the dictionary: 0 (invalid), 1 (valid)
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

// Create a compound index on dictionaryName and value
dictionarySchema.index({ key: 1, value: 1 }, { unique: true })

const Dictionary = mongoose.model('Dictionary', dictionarySchema)

module.exports = Dictionary
