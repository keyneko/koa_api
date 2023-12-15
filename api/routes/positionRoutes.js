const Router = require('koa-router')
const positionRouter = new Router()
const authController = require('../controllers/authController')
const positionController = require('../controllers/positionController')

// Get all positions
positionRouter.get(
  '/positions',
  authController.hasToken,
  positionController.getPositions,
)

// Get a single position by value
positionRouter.get(
  '/position',
  authController.hasToken,
  positionController.getPosition,
)

// Create a position
positionRouter.post(
  '/position',
  authController.hasToken,
  positionController.createPosition,
)

// Update a position by value
positionRouter.put(
  '/position',
  authController.hasToken,
  positionController.updatePosition,
)

// Delete a position by value
positionRouter.delete(
  '/position',
  authController.isAdmin,
  positionController.deletePosition,
)

module.exports = positionRouter
