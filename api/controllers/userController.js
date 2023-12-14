const bcrypt = require('bcrypt')
const Role = require('../models/role')
const User = require('../models/user')
const authController = require('../controllers/authController')
const { logger } = require('../logger')
const { decryptPassword } = require('../utils/rsa')
const {
  getErrorMessage,
  statusCodes,
  statusMessages,
} = require('../statusCodes')

async function getUsers(ctx) {
  try {
    const { sortBy = '_id', sortOrder = 'desc' /* asc */ } = ctx.query
    const language = ctx.cookies.get('language')

    const sortOptions = {
      [sortBy]: sortOrder === 'desc' ? -1 : 1,
    }

    const users = await User.find()
      .select(['username', 'name', 'avatar', 'roles', 'status', 'translations'])
      .sort(sortOptions)

    // Add the 'token' field to each user object
    const usersWithToken = users.map((user) => ({
      _id: user._id,
      username: user.username,
      name: user.translations?.get(language) || user.name,
      avatar: user.avatar,
      roles: user.roles,
      status: user.status,
      token: authController.generateToken(user),
    }))

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
      'translations',
    ])

    if (!user) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'userNotFound')
      return
    }

    // Calculate unique sops by aggregating roles' sops
    const allSops = []
    for (const value of user.roles) {
      const role = await Role.findOne({ value }).select('sops')
      if (role) {
        allSops.push(...role.sops)
      }
    }

    // Deduplicate sops list
    const uniqueSops = Array.from(new Set(allSops))

    ctx.body = {
      code: 200,
      data: {
        username: user.username,
        name: user.translations?.get(language) || user.name,
        avatar: user.avatar,
        roles: user.roles,
        sops: uniqueSops,
      },
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function updateUser(ctx) {
  try {
    const userId = ctx.state.decoded.userId
    const { username, name, password, newPassword, avatar, roles, status } =
      ctx.request.body
    const language = ctx.cookies.get('language')

    let user

    if (username) {
      user = await User.findOne({ username })
    } else {
      user = await User.findById(userId)
    }

    if (!user) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'userNotFound')
      return
    }

    // Check if the user exists and verify the password
    if (password) {
      // Decrypt the encrypted password
      const decryptedPassword = decryptPassword(password)

      if (await bcrypt.compare(decryptedPassword, user.password)) {
        if (newPassword) {
          // Decrypt the encrypted password
          const decryptedNewPassword = decryptPassword(newPassword)

          const hashedPassword = await bcrypt.hash(decryptedNewPassword, 10)
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

    // Update default fields for 'zh' or undefined language
    if (language === 'zh' || language === undefined) {
      user.name = name || user.name
    } else {
      // Update translations based on the specified language
      if (name) {
        user.translations = user.translations || new Map()
        user.translations.set(language, name)
      }

      // Mark the modified fields to ensure they are saved
      user.markModified('translations')
    }

    user.avatar = avatar || user.avatar
    user.status = status || user.status
    if (roles !== undefined) user.roles = roles

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

    const user = await User.findById(userId)
    if (!user) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'userNotFound')
      return
    }

    // Check if the user being deleted has admin role
    if (user.roles.includes(0 /* Administrator */)) {
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
