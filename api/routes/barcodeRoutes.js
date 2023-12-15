const Router = require('koa-router')
const barcodeRouter = new Router()
const authController = require('../controllers/authController')
const barcodeController = require('../controllers/barcodeController')

// Get all barcodes
barcodeRouter.get(
  '/barcodes',
  authController.hasToken,
  barcodeController.getBarcodes,
)

// Get a single barcode by value
barcodeRouter.get(
  '/barcode',
  authController.hasToken,
  barcodeController.getBarcode,
)

// Create a barcode
barcodeRouter.post(
  '/barcode',
  authController.hasToken,
  barcodeController.createBarcode,
)

// Update a barcode by value
barcodeRouter.put(
  '/barcode',
  authController.hasToken,
  barcodeController.updateBarcode,
)

// Delete a barcode by value
barcodeRouter.delete(
  '/barcode',
  authController.isAdmin,
  barcodeController.deleteBarcode,
)

module.exports = barcodeRouter
