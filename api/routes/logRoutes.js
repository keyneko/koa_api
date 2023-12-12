const logger = require('../logger')
const Router = require('koa-router')
const logRouter = new Router()
const authController = require('../controllers/authController')
const {
  getErrorMessage,
  statusCodes,
  statusMessages,
} = require('../statusCodes')

// Upload file
logRouter.post('/log', authController.hasToken, async (ctx) => {
  try {
    const { message, stack } = ctx.request.body

    // Log the error
    logger.error('@@From frontend@@ ' + message)
    logger.error(stack)

    ctx.body = { code: 200 }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
})

module.exports = logRouter
