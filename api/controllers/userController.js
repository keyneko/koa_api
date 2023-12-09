const bcrypt = require('bcrypt')
const User = require('../models/user')
const authController = require('../controllers/authController')
const {
  getErrorMessage,
  statusCodes,
  statusMessages,
} = require('../statusCodes')

async function getUsers(ctx) {
  try {
    const language = ctx.cookies.get('language')

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
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function getUser(ctx) {
  try {
    const userId = ctx.state.decoded.userId
    const language = ctx.cookies.get('language')

    const user = await User.findById(userId).select([
      'username',
      'name',
      'avatar',
      'roles',
    ])

    if (!user) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'userNotFound')
      return
    }

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: user,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function updateUser(ctx) {
  try {
    const userId = ctx.state.decoded.userId
    const { name, password, newPassword, avatar } = ctx.request.body
    const language = ctx.cookies.get('language')

    const user = await User.findById(userId)

    if (!user) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'userNotFound')
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
        ctx.status = statusCodes.PasswordError
        ctx.body = getErrorMessage(
          statusCodes.PasswordError,
          language,
          'invalidOriginalPassword',
        )
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
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function deleteUser(ctx) {
  try {
    const userId = ctx.query.id
    const language = ctx.cookies.get('language')

    // Check if the user being deleted is an admin
    const userToDelete = await User.findById(userId)
    if (!userToDelete) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'userNotFound')
      return
    }

    if (userToDelete.username === 'admin') {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'cannotDeleteAdmin',
      )
      return
    }

    const result = await User.findByIdAndDelete(userId)
    if (!result) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'userNotFound')
      return
    }

    ctx.status = 200
    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
}
