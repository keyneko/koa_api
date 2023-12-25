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

// Get a dictionary
dictionaryRouter.get(
  '/dictionary',
  authController.hasToken,
  dictionaryController.getDictionary,
)

// Create a dictionary
dictionaryRouter.post(
  '/dictionary',
  authController.isAdmin,
  dictionaryController.createDictionary,
)

// Update a dictionary
dictionaryRouter.put(
  '/dictionary',
  authController.isAdmin,
  dictionaryController.updateDictionary,
)

// Delete a dictionary
dictionaryRouter.delete(
  '/dictionary',
  authController.isAdmin,
  dictionaryController.deleteDictionary,
)

module.exports = dictionaryRouter
