const Permission = require('../models/permission')
const authController = require('../controllers/authController')
const { logger } = require('../utils/logger')
const {
  getErrorMessage,
  statusCodes,
  statusMessages,
} = require('../utils/statusCodes')

async function getPermissions(ctx) {
  try {
    const language = ctx.cookies.get('language')

    const permissions = await Permission.find().select([
      'name',
      'description',
      'pattern',
      'status',
      'translations',
    ])

    const mapped = permissions.map((d) => ({
      ...d.toObject(),
      name: d.translations?.name?.[language] || d.name,
      description: d.translations?.description?.[language] || d.description,
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

async function createPermission(ctx) {
  try {
    const { name, description, pattern } = ctx.request.body
    const language = ctx.cookies.get('language')

    const newPermission = new Permission({
      name,
      description,
      pattern,
    })

    // Handle translations based on the language value
    if (language === 'zh' || language === undefined) {
    } else {
      // Use $set to add translations
      newPermission.$set('translations', {
        name: {
          [language]: name,
        },
        description: {
          [language]: description,
        },
      })
    }

    await newPermission.save()

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function updatePermission(ctx) {
  try {
    const { _id, name, description, pattern, status } = ctx.request.body
    const language = ctx.cookies.get('language')

    const permission = await Permission.findById(_id)
    if (!permission) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'permissionNotFound',
      )
      return
    }

    // Update default fields for 'zh' or undefined language
    if (language === 'zh' || language === undefined) {
      permission.name = name
    } else {
      // Update translations based on the specified language
      if (name) {
        permission.translations.name = {
          ...(permission.translations.name || {}),
          [language]: name,
        }
      }

      if (description) {
        permission.translations.description = {
          ...(permission.translations.description || {}),
          [language]: description,
        }
      }

      // Mark the modified fields to ensure they are saved
      permission.markModified('translations')
    }

    permission.pattern = pattern
    permission.status = status

    await permission.save()

    ctx.status = 200
    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function deletePermission(ctx) {
  try {
    const { _id } = ctx.query
    const language = ctx.cookies.get('language')

    const result = await Permission.findByIdAndDelete(_id)
    if (!result) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'permissionNotFound',
      )
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
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
}
