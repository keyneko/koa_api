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

    const sortOptions = {
      pattern: 1,
    }

    const permissions = await Permission.find()
      .select([
        'name',
        'description',
        'pattern',
        'status',
        'isProtected',
        'translations',
      ])
      .sort(sortOptions)

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
    logger.error(error.message)
  }
}

async function createPermission(ctx) {
  try {
    const { name, description, pattern, isProtected } = ctx.request.body
    const language = ctx.cookies.get('language')

    const newPermission = new Permission({
      name,
      description,
      pattern,
      isProtected,
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
      data: newPermission._id,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
}

async function updatePermission(ctx) {
  try {
    const { _id, name, description, pattern, status, isProtected } =
      ctx.request.body
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
      permission.name = name || permission.name
      if (description != undefined) permission.description = description
    } else {
      // Update translations based on the specified language
      if (name) {
        permission.translations.name = {
          ...(permission.translations.name || {}),
          [language]: name,
        }
      }

      if (description != undefined) {
        permission.translations.description = {
          ...(permission.translations.description || {}),
          [language]: description,
        }
      }

      // Mark the modified fields to ensure they are saved
      permission.markModified('translations')
    }

    if (pattern != undefined) permission.pattern = pattern
    if (status != undefined) permission.status = status
    if (isProtected !== undefined) permission.isProtected = isProtected

    await permission.save()

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

async function deletePermission(ctx) {
  try {
    const { _id } = ctx.query
    const language = ctx.cookies.get('language')

    // Find the permission
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

    // Check if it is protected
    if (permission.isProtected) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'protectedPermission',
      )
      return
    }

    // If not protected, delete the permission
    const result = await Permission.findByIdAndDelete(_id)
    if (!result) {
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
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
}
