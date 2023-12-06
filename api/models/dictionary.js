const mongoose = require('mongoose')

const dictionarySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
})

// Create a compound index on dictionaryName and value
dictionarySchema.index({ key: 1, value: 1 }, { unique: true })

const Dictionary = mongoose.model('Dictionary', dictionarySchema)

module.exports = Dictionary
