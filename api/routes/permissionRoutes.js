const Router = require('koa-router')
const permissionRouter = new Router()
const authController = require('../controllers/authController')
const permissionController = require('../controllers/permissionController')

// Get all permissions
permissionRouter.get(
  '/permissions',
  authController.hasToken,
  permissionController.getPermissions,
)

// Create a permission (accessible only to admins)
permissionRouter.post(
  '/permission',
  authController.isAdmin,
  permissionController.createPermission,
)

// Update a permission (accessible only to admins)
permissionRouter.put(
  '/permission',
  authController.isAdmin,
  permissionController.updatePermission,
)

// Delete a permission (accessible only to admins)
permissionRouter.delete(
  '/permission',
  authController.isAdmin,
  permissionController.deletePermission,
)

module.exports = permissionRouter
