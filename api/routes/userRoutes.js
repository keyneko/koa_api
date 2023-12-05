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
        name: user.name,
        avatar: user.avatar,
        roles: user.roles,
      })),
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = 'Internal Server Error'
  }
})

// Get user information (if id is not provided, return the current user's info)
userRouter.get('/user', authController.hasToken, async (ctx) => {
  try {
    const userId = ctx.request.query.id || ctx.state.decoded.userId
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
        name: user.name,
        avatar: user.avatar,
        roles: user.roles,
      },
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = 'Internal Server Error'
  }
})

// Update a user by ID
userRouter.put('/user', authController.hasToken, async (ctx) => {
  try {
    const userId = ctx.request.body.id || ctx.state.decoded.userId
    const { name, password, newPassword, avatar } = ctx.request.body
    const user = await User.findById(userId)

    if (!user) {
      ctx.status = 404
      ctx.body = 'User not found'
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
        ctx.status = 500
        ctx.body = '原密码错误'
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
    ctx.status = 500
    ctx.body = 'Internal Server Error'
  }
})

// Delete a user by ID (accessible only to admins)
userRouter.delete('/user', authController.isAdmin, async (ctx) => {
  try {
    const userId = ctx.request.body.id

    // Check if the user being deleted is an admin
    const userToDelete = await User.findById(userId)
    if (!userToDelete) {
      ctx.status = 404
      ctx.body = 'User not found'
      return
    }

    if (userToDelete.username === 'admin') {
      ctx.status = 500
      ctx.body = 'Forbidden: Cannot delete admin accounts'
      return
    }

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
