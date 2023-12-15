const Router = require('koa-router')
const authController = require('../controllers/authController')
const authRouter = new Router()

// Get captcha
authRouter.get('/captcha', authController.captcha)

// Register
authRouter.post('/register', authController.register)

// Login
authRouter.post('/login', authController.login)

// Logout
authRouter.post('/logout', authController.hasToken, authController.logout)

module.exports = authRouter
