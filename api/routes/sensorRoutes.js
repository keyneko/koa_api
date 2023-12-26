const Router = require('koa-router')
const sensorRouter = new Router()
const authController = require('../controllers/authController')
const sensorController = require('../controllers/sensorController')

// Get all sensors
sensorRouter.get(
  '/sensors',
  authController.hasToken,
  sensorController.getSensors,
)

// Create a sensor
sensorRouter.post(
  '/sensor',
  authController.hasToken,
  sensorController.createSensor,
)

// Update a sensor
sensorRouter.put(
  '/sensor',
  authController.hasToken,
  sensorController.updateSensor,
)

// Delete a sensor
sensorRouter.delete(
  '/sensor',
  authController.isAdmin,
  sensorController.deleteSensor,
)

// Publish a message to clinet
sensorRouter.post(
  '/sensor/publish',
  authController.hasToken,
  sensorController.publishMessage,
)

// Get all records
sensorRouter.get(
  '/sensor/records',
  authController.hasToken,
  sensorController.getRecords,
)

// Create a record
sensorRouter.post(
  '/sensor/record',
  authController.hasApiKey,
  sensorController.createRecord,
)

module.exports = sensorRouter
