const Role = require('../models/role')
const authController = require('../controllers/authController')
const {
  getErrorMessage,
  statusCodes,
  statusMessages,
} = require('../statusCodes')

async function getRoles(ctx) {
  try {
    const { sortBy = '_id', sortOrder = 'desc' /* asc */ } = ctx.query
    const language = ctx.cookies.get('language')

    const sortOptions = {
      [sortBy]: sortOrder === 'desc' ? -1 : 1,
    }

    const roles = await Role.find()
      .select(['value', 'name', 'sops', 'status', 'translations'])
      .sort(sortOptions)

    const mappedRoles = roles.map((role) => ({
      _id: role._id,
      value: role.value,
      name: role.translations?.get(language) || role.name,
      sops: role.sops,
      status: role.status,
    }))

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: mappedRoles,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function createRole(ctx) {
  try {
    const { name, sops, status } = ctx.request.body
    const language = ctx.cookies.get('language')

    // Query the database to find the maximum value among existing roles
    const maxRole = await Role.findOne().sort('-value')

    // Determine the new role's value by incrementing the maximum value
    const value = maxRole ? maxRole.value + 1 : 1

    const newRole = new Role({
      value,
      sops,
      status,
    })

    // Handle translations based on the language value
    if (language === 'zh' || language === undefined) {
      newRole.name = name
    } else {
      newRole.translations = newRole.translations || new Map()
      newRole.translations.set(language, name)
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
    const { value, name, status, sops } = ctx.request.body
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

    role.status = status
    role.sops = sops

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
