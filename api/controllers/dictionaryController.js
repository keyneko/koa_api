const Dictionary = require('../models/dictionary')
const { logger } = require('../utils/logger')
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

async function getDictionaries(ctx) {
  try {
    const { pageNum = 1, pageSize = 10, key, status } = ctx.query
    const language = ctx.cookies.get('language')

    const filter = {}
    if (status !== undefined && status !== '') {
      filter.status = status
    }

    // Fuzzy search for name (case-insensitive)
    if (key !== undefined && key !== '') {
      filter.key = { $regex: new RegExp(key, 'i') }
    }

    const skip = (pageNum - 1) * pageSize
    const limit = parseInt(pageSize)

    const [dictionaries, total] = await Promise.all([
      Dictionary.find(filter)
        .select([
          'key',
          'value',
          'name',
          'status',
          'isProtected',
          'translations',
        ])
        .sort({ key: 1, value: 1 })
        .skip(skip)
        .limit(limit),
      Dictionary.countDocuments(filter),
    ])

    ctx.body = {
      code: 200,
      data: dictionaries.map((dictionary) => ({
        ...dictionary.toObject(),
        name: dictionary.translations?.get(language) || dictionary.name,
        translations: undefined,
      })),
      total,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
}

async function getDictionary(ctx) {
  try {
    const { key } = ctx.query
    const language = ctx.cookies.get('language')

    // Query the dictionary based on the key
    const dictionary = await Dictionary.find({ key }).select([
      'value',
      'name',
      'translations',
    ])

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: dictionary.map((d) => ({
        value: d.value,
        name: d.translations?.get(language) || d.name,
      })),
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
}

async function createDictionary(ctx) {
  try {
    const { key, value, name, isProtected } = ctx.request.body
    const language = ctx.cookies.get('language')

    const dictionary = new Dictionary({
      key,
      value,
      name,
      isProtected,
    })

    if (language === 'zh' || language === undefined) {
    } else {
      dictionary.translations = { [language]: name }
    }

    await dictionary.save()

    ctx.body = {
      code: 200,
      data: dictionary._id,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
}

async function updateDictionary(ctx) {
  try {
    const { _id, name, isProtected, status } = ctx.request.body
    const language = ctx.cookies.get('language')

    // const dictionary = await Dictionary.findById(_id)
    // if (!dictionary) {
    //   ctx.status = statusCodes.NotFound
    //   ctx.body = getErrorMessage(
    //     statusCodes.NotFound,
    //     language,
    //     'dictionaryNotFound',
    //   )
    //   return
    // }

    // if (language === 'zh' || language === undefined) {
    // } else {
    //   dictionary.translations.set(language, name)
    //   dictionary.markModified('translations')
    // }

    // if (isProtected != undefined) dictionary.isProtected = isProtected
    // if (status != undefined) dictionary.status = status

    // await dictionary.save()

    const updateFields = {}

    if (language === 'zh' || language === undefined) {
      updateFields.name = name
    } else {
      updateFields[`translations.${language}`] = name
    }

    if (isProtected !== undefined) {
      updateFields.isProtected = isProtected
    }

    if (status !== undefined) {
      updateFields.status = status
    }

    const result = await Dictionary.findByIdAndUpdate(
      { _id },
      { $set: updateFields },
      { new: true },
    )

    if (!result) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'dictionaryNotFound',
      )
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

async function deleteDictionary(ctx) {
  try {
    const { _id } = ctx.query
    const language = ctx.cookies.get('language')

    const dictionary = await Dictionary.findById(_id)

    if (!dictionary) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'dictionaryNotFound',
      )
      return
    }

    // Check if it is protected
    if (dictionary.isProtected) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'protectedDictionary',
      )
      return
    }

    // If not protected, delete the dictionary
    const result = await Dictionary.findByIdAndDelete(_id)
    if (!result) {
      return
    }

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

module.exports = {
  getDictionaries,
  getDictionary,
  createDictionary,
  updateDictionary,
  deleteDictionary,
}
