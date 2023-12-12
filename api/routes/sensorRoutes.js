const Router = require('koa-router')
const sensorRouter = new Router()
const authController = require('../controllers/authController')
const sensorController = require('../controllers/sensorController')

// Get all records
sensorRouter.get(
  '/sensor/records',
  authController.hasToken,
  sensorController.getRecords,
)

// Create a record
sensorRouter.post(
  '/sensor/record',
  authController.hasToken,
  sensorController.createRecord,
)

module.exports = sensorRouter
