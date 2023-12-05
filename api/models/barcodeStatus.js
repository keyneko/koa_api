const mongoose = require('mongoose')

const barcodeStatusSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
})

const BarcodeStatus = mongoose.model('BarcodeStatus', barcodeStatusSchema)

module.exports = BarcodeStatus
