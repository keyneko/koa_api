const Router = require('koa-router')
const logRouter = new Router()
const authController = require('../controllers/authController')
const { frontend, logger } = require('../utils/logger')
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

// Upload file
logRouter.post('/log', authController.hasToken, async (ctx) => {
  try {
    const { message, stack } = ctx.request.body

    // Log the error
    frontend.error(message)
    if (stack) frontend.error(stack)

    ctx.body = { code: 200 }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
})

module.exports = logRouter
