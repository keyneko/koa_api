const Router = require('koa-router')
const dictionaryRouter = new Router()
const Dictionary = require('../models/dictionary')
const authController = require('../controllers/authController')
const { statusCodes } = require('../statusCodes')

// Get all dictionaries
dictionaryRouter.get('/dictionaries', authController.hasToken, async (ctx) => {
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
})

// Create dictionaries
dictionaryRouter.post('/dictionaries', authController.isAdmin, async (ctx) => {
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
})

// Delete dictionaries
dictionaryRouter.delete('/dictionaries', authController.isAdmin, async (ctx) => {
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
})

module.exports = dictionaryRouter
