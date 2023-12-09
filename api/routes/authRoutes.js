const Router = require('koa-router')
const authController = require('../controllers/authController')
const authRouter = new Router()

authRouter.get('/captcha', authController.captcha)
authRouter.post('/register', authController.register)
authRouter.post('/login', authController.login)
authRouter.post('/logout', authController.hasToken, authController.logout)

module.exports = authRouter
