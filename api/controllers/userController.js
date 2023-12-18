const bcrypt = require('bcrypt')
const Role = require('../models/role')
const User = require('../models/user')
const Permission = require('../models/permission')
const authController = require('../controllers/authController')
const { logger } = require('../utils/logger')
const { decryptPassword } = require('../utils/rsa')
const {
  getErrorMessage,
  statusCodes,
  statusMessages,
} = require('../utils/statusCodes')

async function getUsers(ctx) {
  try {
    const { sortBy = '_id', sortOrder = 'desc' /* asc */ } = ctx.query
    const language = ctx.cookies.get('language')

    const sortOptions = {
      [sortBy]: sortOrder === 'desc' ? -1 : 1,
    }

    const users = await User.find()
      .select([
        'username',
        'name',
        'avatar',
        'roles',
        'status',
        'isProtected',
        'translations',
      ])
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
        },
      })
      .populate('denyPermissions')
      .sort(sortOptions)

    // Add the 'token' field to each user object
    const mapped = users.map((d) => ({
      ...d.toObject(),
      name: d.translations?.get(language) || d.name,
      token: authController.generateToken(d),
      roles: d.roles.map((role) => role.value),
      sops: [...new Set(d.roles.flatMap((role) => role.sops))],
      permissions: [
        ...new Set(
          d.roles.flatMap((role) =>
            role.permissions.map((permission) => permission.pattern),
          ),
        ),
      ],
      denyPermissions: [
        ...new Set(d.denyPermissions.map((permission) => permission.pattern)),
      ],
      password: undefined,
      translations: undefined,
    }))

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: mapped,
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

    const user = await User.findById(userId)
      .select([
        'username',
        'name',
        'avatar',
        'roles',
        'denyPermissions',
        'status',
        'isProtected',
        'translations',
      ])
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
        },
      })
      .populate('denyPermissions')

    if (!user) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'userNotFound')
      return
    }

    ctx.body = {
      code: 200,
      data: {
        ...user.toObject(),
        name: user.translations?.get(language) || user.name,
        roles: user.roles.map((role) => role.value),
        sops: [...new Set(user.roles.flatMap((role) => role.sops))],
        permissions: [
          ...new Set(
            user.roles.flatMap((role) =>
              role.permissions.map((permission) => permission.pattern),
            ),
          ),
        ],
        denyPermissions: [
          ...new Set(
            user.denyPermissions.map((permission) => permission.pattern),
          ),
        ],
        translations: undefined,
        _id: undefined,
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
    const {
      username,
      name,
      password,
      newPassword,
      avatar,
      roles,
      denyPermissions,
      status,
      isProtected,
    } = ctx.request.body
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

    if (avatar !== undefined) user.avatar = avatar
    if (status !== undefined) user.status = status
    if (isProtected !== undefined) user.isProtected = isProtected

    // Convert value array to _id array for roles
    if (roles !== undefined) {
      const roleObjects = await Role.find({ value: { $in: roles } }, '_id')
      user.roles = roleObjects.map((role) => role._id)
    }

    // Convert pattern array to _id array for roles
    if (denyPermissions !== undefined) {
      const perms = await Permission.find(
        { pattern: { $in: denyPermissions } },
        '_id',
      )
      user.denyPermissions = perms.map((p) => p._id)
    }

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
    const { _id } = ctx.query
    const language = ctx.cookies.get('language')

    const user = await User.findById(_id).populate({
      path: 'roles',
      select: 'isAdmin',
    })

    if (!user) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'userNotFound')
      return
    }

    // Check if the user being deleted has admin role
    if (user.roles.some((role) => role.isAdmin)) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'cannotDeleteAdmin',
      )
      return
    }

    // Check if it is protected
    if (user.isProtected) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'protectedUser',
      )
      return
    }

    const result = await User.findByIdAndDelete(_id)
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
