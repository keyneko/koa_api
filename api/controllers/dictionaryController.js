const Dictionary = require('../models/dictionary')
const { statusCodes } = require('../statusCodes')

async function getDictionaries(ctx) {
  try {
    const { key } = ctx.query

    // Assume you have access to the user's language from cookies
    const language = ctx.cookies.get('language') || 'zh'

    // Query the dictionaries based on the key
    const dictionaries = await Dictionary.find({ key }).select([
      'value',
      'name',
      'translations',
    ])

    // Map over the dictionaries to retrieve translated names or use default names
    const mappedDictionaries = dictionaries.map((dictionary) => ({
      value: dictionary.value,
      name: dictionary.translations?.get(language) || dictionary.name,
    }))

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: mappedDictionaries,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError.code
    ctx.body = error.message
  }
}

async function createDictionaries(ctx) {
  try {
    const { key, names } = ctx.request.body
    // Assume you have access to the user's language from cookies
    const language = ctx.cookies.get('language')

    // Use map to create an array of promises
    const dictionaryPromises = names.map(async (name, value) => {
      // Check if the dictionary with the given key and value already exists
      const existingDictionary = await Dictionary.findOne({ key, value })

      // If it exists, update the dictionary
      if (existingDictionary) {
        // Update the name if language is 'zh' or undefined
        if (language === 'zh' || language === undefined) {
          existingDictionary.name = name
        } else {
          // Ensure translations is initialized as a Map
          existingDictionary.translations =
            existingDictionary.translations || new Map()
          // Handle updating translations for Map data type
          existingDictionary.translations.set(language, name)
        }

        return existingDictionary.save()
      } else {
        // If it doesn't exist, create a new dictionary
        const newDictionary = new Dictionary({
          key,
          value,
        })

        // Set the name or translations based on the language
        if (language === 'zh' || language === undefined) {
          newDictionary.name = name
        } else {
          newDictionary.translations = { [language]: name }
        }

        return newDictionary.save()
      }
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
