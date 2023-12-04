const bcrypt = require('bcrypt')
const Router = require('koa-router')
const userRouter = new Router()
const User = require('../models/user')
const authController = require('../controllers/authController')

// Get all users (accessible only to admins)
userRouter.get('/users', authController.isAdmin, async (ctx) => {
  try {
    const users = await User.find()
    ctx.status = 200
    ctx.body = {
      code: 200,
      data: users.map((user) => ({
        id: user.id,
        username: user.username,
        token: authController.generateToken(user),
      })),
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = 'Internal Server Error'
  }
})

// Get user information (if id is not provided, return the current user's info)
userRouter.get('/user/:id?', authController.hasToken, async (ctx) => {
  try {
    const userId = ctx.params.id || ctx.state.decoded.userId
    const user = await User.findById(userId)

    if (!user) {
      ctx.status = 404
      ctx.body = 'User not found'
      return
    }

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: {
        id: user.id,
        username: user.username,
      },
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = 'Internal Server Error'
  }
})

// Update a user by ID (accessible only to admins)
userRouter.put('/user/:id', authController.isAdmin, async (ctx) => {
  try {
    const userId = ctx.params.id
    const { password } = ctx.request.body
    const user = await User.findById(userId)

    if (!user) {
      ctx.status = 404
      ctx.body = 'User not found'
      return
    }

    // Validate and hash the password
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      user.password = hashedPassword
    }

    await user.save()

    ctx.status = 200
    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = 'Internal Server Error'
  }
})

// Delete a user by ID (accessible only to admins)
userRouter.delete('/user/:id', authController.isAdmin, async (ctx) => {
  try {
    const userId = ctx.params.id

    const result = await User.findByIdAndDelete(userId)
    if (!result) {
      ctx.status = 404
      ctx.body = 'User not found'
      return
    }

    ctx.status = 200
    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = 'Internal Server Error'
  }
})

module.exports = userRouter
