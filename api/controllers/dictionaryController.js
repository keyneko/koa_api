const Dictionary = require('../models/dictionary')
const { statusCodes } = require('../statusCodes')

async function getDictionaries(ctx) {
  try {
    const { key } = ctx.query
    const dictionaries = await Dictionary.find({ key }).select(['value', 'name'])

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: dictionaries,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError.code
    ctx.body = error.message
  }
}

async function createDictionaries(ctx) {
  try {
    const { key, names } = ctx.request.body

    // Use map to create an array of promises
    const dictionaryPromises = names.map((name, value) => {
      const dictionary = new Dictionary({
        key,
        value,
        name,
      })
      return dictionary.save()
    })

    // Use Promise.all to await all promises in parallel
    await Promise.all(dictionaryPromises)

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError.code
    ctx.body = error.message
  }
}

async function deleteDictionaries(ctx) {
  try {
    const key = ctx.query.key
    const result = await Dictionary.deleteMany({ key })

    if (result.deletedCount === 0) {
      ctx.status = statusCodes.NotFound.code
      ctx.body = statusCodes.NotFound.messages.dictionariesNotFound
      return
    }

    ctx.status = 200
    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError.code
    ctx.body = error.message
  }
}

module.exports = {
  getDictionaries,
  createDictionaries,
  deleteDictionaries,
}
