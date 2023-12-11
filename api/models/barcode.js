const mongoose = require('mongoose')

const barcodeSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  basicUnit: {
    type: String,
    default: 'pcs',
  },
  options: {
    type: Object,
    default: {},
  },
  position: {
    type: String,
  },
  // Status: 0 (invalid), 1 (valid)
  status: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
  files: {
    type: [String],
    default: [],
  },
  translations: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
})

const Barcode = mongoose.model('Barcode', barcodeSchema)

module.exports = Barcode
