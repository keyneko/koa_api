const Router = require('koa-router')
const authController = require('../controllers/authController')
const authRouter = new Router()

// 验证码
authRouter.get('/captcha', authController.captcha)

// 注册
authRouter.post('/register', authController.register)

// 登录
authRouter.post('/login', authController.login)

// 登出
authRouter.post('/logout', authController.hasToken, authController.logout)

module.exports = authRouter
