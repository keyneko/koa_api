const Role = require('../models/role')
const Permission = require('../models/permission')
const authController = require('../controllers/authController')
const { logger } = require('../utils/logger')
const {
  getErrorMessage,
  statusCodes,
  statusMessages,
} = require('../utils/statusCodes')

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
  }
}

async function createRole(ctx) {
  try {
    const { name, status, sops, permissions /* patterns */ } = ctx.request.body
    const language = ctx.cookies.get('language')

    // Query the database to find the maximum value among existing roles
    const maxRole = await Role.findOne().sort('-value')

    // Determine the new role's value by incrementing the maximum value
    const value = maxRole ? maxRole.value + 1 : 1

    const newRole = new Role({
      value,
      status,
    })

    // Handle translations based on the language value
    if (language === 'zh' || language === undefined) {
      newRole.name = name
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
      data: value,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function updateRole(ctx) {
  try {
    const { value, name, status, sops, permissions } = ctx.request.body
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
  }
}

async function deleteRole(ctx) {
  try {
    const { value } = ctx.query
    const language = ctx.cookies.get('language')

    // Check if the role being deleted is admin
    if (value == 0 /* Administrator */) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'cannotDeleteAdmin',
      )
      return
    }

    const result = await Role.findOneAndDelete({ value })
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
  }
}

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
}
