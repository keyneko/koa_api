const Router = require('koa-router')
const roleRouter = new Router()
const authController = require('../controllers/authController')
const roleController = require('../controllers/roleController')

// Get all roles
roleRouter.get('/roles', authController.hasToken, roleController.getRoles)

// Create a role (accessible only to admins)
roleRouter.post('/role', authController.isAdmin, roleController.createRole)

// Update a role (accessible only to admins)
roleRouter.put('/role', authController.isAdmin, roleController.updateRole)

// Delete a role (accessible only to admins)
roleRouter.delete('/role', authController.isAdmin, roleController.deleteRole)

module.exports = roleRouter
