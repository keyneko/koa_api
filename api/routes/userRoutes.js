const bcrypt = require('bcrypt')
const Router = require('koa-router')
const userRouter = new Router()
const User = require('../models/user')
const authController = require('../controllers/authController')
const { statusCodes } = require('../statusCodes')

// Get all users (accessible only to admins)
userRouter.get('/users', authController.isAdmin, async (ctx) => {
  try {
    const users = await User.find().select([
      'username',
      'name',
      'avatar',
      'roles',
    ])

    // Add the 'token' field to each user object
    const usersWithToken = users.map((user) => {
      return {
        ...user.toObject(),
        token: authController.generateToken(user),
      }
    })

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: usersWithToken,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError.code
    ctx.body = statusCodes.InternalServerError.messages.default
  }
})

// Get user information (if id is not provided, return the current user's info)
userRouter.get('/user', authController.hasToken, async (ctx) => {
  try {
    const userId = ctx.request.query.id || ctx.state.decoded.userId
    const user = await User.findById(userId).select([
      'username',
      'name',
      'avatar',
      'roles',
    ])

    if (!user) {
      ctx.status = statusCodes.NotFound.code
      ctx.body = statusCodes.NotFound.messages.userNotFound
      return
    }

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: user,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError.code
    ctx.body = statusCodes.InternalServerError.messages.default
  }
})

// Update a user by ID
userRouter.put('/user', authController.hasToken, async (ctx) => {
  try {
    const userId = ctx.request.body.id || ctx.state.decoded.userId
    const { name, password, newPassword, avatar } = ctx.request.body
    const user = await User.findById(userId)

    if (!user) {
      ctx.status = statusCodes.NotFound.code
      ctx.body = statusCodes.NotFound.messages.userNotFound
      return
    }

    // Check if the user exists and verify the password
    if (password) {
      if (await bcrypt.compare(password, user.password)) {
        if (newPassword) {
          const hashedPassword = await bcrypt.hash(newPassword, 10)
          user.password = hashedPassword
        }
      } else {
        ctx.status = statusCodes.PasswordError.code
        ctx.body = statusCodes.PasswordError.messages.invalidOriginalPassword
        return
      }
    }

    user.name = name || user.name
    user.avatar = avatar || user.avatar

    await user.save()

    ctx.status = 200
    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError.code
    ctx.body = statusCodes.InternalServerError.messages.default
  }
})

// Delete a user by ID (accessible only to admins)
userRouter.delete('/user', authController.isAdmin, async (ctx) => {
  try {
    const userId = ctx.query.id

    // Check if the user being deleted is an admin
    const userToDelete = await User.findById(userId)
    if (!userToDelete) {
      ctx.status = statusCodes.NotFound.code
      ctx.body = statusCodes.NotFound.messages.userNotFound
      return
    }

    if (userToDelete.username === 'admin') {
      ctx.status = statusCodes.Forbidden.code
      ctx.body = statusCodes.Forbidden.messages.cannotDeleteAdmin
      return
    }

    const result = await User.findByIdAndDelete(userId)
    if (!result) {
      ctx.status = statusCodes.NotFound.code
      ctx.body = statusCodes.NotFound.messages.userNotFound
      return
    }

    ctx.status = 200
    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError.code
    ctx.body = statusCodes.InternalServerError.messages.default
  }
})

module.exports = userRouter
