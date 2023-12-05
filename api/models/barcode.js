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
  basicUnit:  {
    type: String,
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
})

const Barcode = mongoose.model('Barcode', barcodeSchema)

module.exports = Barcode
