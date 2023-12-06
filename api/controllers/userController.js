const bcrypt = require('bcrypt')
const User = require('../models/user')
const authController = require('../controllers/authController')
const { statusCodes } = require('../statusCodes')

async function getUsers(ctx) {
  try {
    const users = await User.find().select(['username', 'name', 'avatar', 'roles'])

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
    ctx.body = error.message
  }
}

async function getUser(ctx) {
  try {
    const userId = ctx.state.decoded.userId
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
    ctx.body = error.message
  }
}

async function updateUser(ctx) {
  try {
    const userId = ctx.state.decoded.userId
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
    ctx.body = error.message
  }
}

async function deleteUser(ctx) {
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
    ctx.body = error.message
  }
}

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
}
