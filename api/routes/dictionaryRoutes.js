const Router = require('koa-router')
const dictionaryRouter = new Router()
const authController = require('../controllers/authController')
const dictionaryController = require('../controllers/dictionaryController')

// Get all dictionaries
dictionaryRouter.get(
  '/dictionaries',
  authController.hasToken,
  dictionaryController.getDictionaries,
)

// Create dictionaries
dictionaryRouter.post(
  '/dictionaries',
  authController.isAdmin,
  dictionaryController.createDictionaries,
)

// Delete dictionaries
dictionaryRouter.delete(
  '/dictionaries',
  authController.isAdmin,
  dictionaryController.deleteDictionaries,
)

module.exports = dictionaryRouter
