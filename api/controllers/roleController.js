const Role = require('../models/role')
const authController = require('../controllers/authController')
const {
  getErrorMessage,
  statusCodes,
  statusMessages,
} = require('../statusCodes')

async function getRoles(ctx) {
  try {
    const language = ctx.cookies.get('language')

    const roles = await Role.find().select([
      'value',
      'name',
      'sops',
      'status',
      'translations',
    ])

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
    const { value, name, sops, status } = ctx.request.body
    const language = ctx.cookies.get('language')

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

    role.status = status || role.status
    role.sops = sops || role.sops

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
