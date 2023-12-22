const Role = require('../models/role')
const Permission = require('../models/permission')
const authController = require('../controllers/authController')
const { logger } = require('../utils/logger')
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

async function getRoles(ctx) {
  try {
    const { sortBy = '_id', sortOrder = 'asc' } = ctx.query
    const language = ctx.cookies.get('language')

    const sortOptions = {
      [sortBy]: sortOrder === 'desc' ? -1 : 1,
    }

    const roles = await Role.find()
      .select([
        'value',
        'name',
        'status',
        'isProtected',
        'sops',
        'permissions',
        'translations',
      ])
      .populate('permissions')
      .sort(sortOptions)

    const mapped = roles.map((d) => ({
      ...d.toObject(),
      name: d.translations?.get(language) || d.name,
      permissions: d.permissions.map((p) => p.pattern),
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
    logger.error(error.message)
  }
}

async function createRole(ctx) {
  try {
    const { value, name, isProtected, sops, permissions /* patterns */ } =
      ctx.request.body
    const language = ctx.cookies.get('language')

    const newRole = new Role({
      name,
      value,
      isProtected,
    })

    // Handle translations based on the language value
    if (language === 'zh' || language === undefined) {
    } else {
      newRole.translations = newRole.translations || new Map()
      newRole.translations.set(language, name)
    }

    if (sops !== undefined) newRole.sops = sops

    // Convert pattern array to _id array for roles
    if (permissions !== undefined) {
      const perms = await Permission.find(
        { pattern: { $in: permissions } },
        '_id',
      )
      newRole.permissions = perms.map((p) => p._id)
    }

    await newRole.save()

    ctx.body = {
      code: 200,
      data: newRole._id,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
}

async function updateRole(ctx) {
  try {
    const { value, name, status, isProtected, sops, permissions } =
      ctx.request.body
    const language = ctx.cookies.get('language')

    const role = await Role.findOne({ value })
    if (!role) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'roleNotFound')
      return
    }

    // Update default fields for 'zh' or undefined language
    if (language === 'zh' || language === undefined) {
      role.name = name || role.name
    } else {
      // Update translations based on the specified language
      if (name) {
        role.translations = role.translations || new Map()
        role.translations.set(language, name)
      }

      // Mark the modified fields to ensure they are saved
      role.markModified('translations')
    }

    if (status !== undefined) role.status = status
    if (isProtected !== undefined) role.isProtected = isProtected
    if (sops !== undefined) role.sops = sops

    // Convert pattern array to _id array for roles
    if (permissions !== undefined) {
      const perms = await Permission.find(
        { pattern: { $in: permissions } },
        '_id',
      )
      role.permissions = perms.map((p) => p._id)
    }

    await role.save()

    ctx.status = 200
    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
}

async function deleteRole(ctx) {
  try {
    const { _id } = ctx.query
    const language = ctx.cookies.get('language')

    const role = await Role.findById(_id)
    if (!role) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'roleNotFound')
      return
    }

    // Check if the role being deleted is admin
    if (role.isAdmin) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'cannotDeleteAdmin',
      )
      return
    }

    // Check if it is protected
    if (role.isProtected) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'protectedRole',
      )
      return
    }

    const result = await Role.findByIdAndDelete(_id)
    if (!result) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'roleNotFound')
      return
    }

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
}

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
}
