const Router = require('koa-router')
const userRouter = new Router()
const authController = require('../controllers/authController')
const userController = require('../controllers/userController')

// Get all users (accessible only to admins)
userRouter.get('/users', authController.isAdmin, userController.getUsers)

// Get user information
userRouter.get('/user', authController.hasToken, userController.getUser)

// Post user information
userRouter.post('/user', authController.isAdmin, userController.createUser)

// Update a user
userRouter.put('/user', authController.hasToken, userController.updateUser)

// Delete a user by ID (accessible only to admins)
userRouter.delete('/user', authController.isAdmin, userController.deleteUser)

module.exports = userRouter
