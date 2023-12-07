const mongoose = require('mongoose')

const barcodeSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
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
  status: {
    type: Number,
    default: 0,
  },
  files: {
    type: [String],
    default: [],
  },
})

const Barcode = mongoose.model('Barcode', barcodeSchema)

module.exports = Barcode
