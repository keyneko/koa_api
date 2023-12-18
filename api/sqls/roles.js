const Role = require('../models/role')
const Permission = require('../models/permission')
const { logger } = require('../utils/logger')

// Inserting roles
async function insertRoles() {
  try {
    const data = [
      {
        name: '系统管理员',
        value: 'admin',
        isAdmin: true,
        isProtected: true,
        sops: [],
        permissions: [],
        translations: {
          en: 'Administrator',
          ja: 'システム管理者',
        },
      },
      {
        name: '仓管员',
        value: 'warehouse keeper',
        isProtected: true,
        sops: [],
        translations: {
          en: 'Warehouse Keeper',
          ja: '倉庫管理者',
        },
      },
      {
        name: '质检员',
        value: 'quality inspector',
        isProtected: true,
        sops: [],
        translations: {
          en: 'Quality Inspector',
          ja: '品質検査員',
        },
      },
      {
        name: '生产员',
        value: 'production worker',
        isProtected: true,
        sops: [],
        translations: {
          en: 'Production Worker',
          ja: '生産作業員',
        },
      },
      {
        name: '巡检员',
        value: 'patrol inspector',
        sops: [],
        translations: {
          en: 'Patrol Inspector',
          ja: '巡回検査官',
        },
      },
    ]

    const promises = data.map((item) => {
      const role = new Role(item)
      return role.save()
    })

    await Promise.all(promises)

    logger.info('Roles inserted successfully.')
  } catch (error) {
    logger.error('Error inserting roles.')
  }
}

async function assignAdminRolesWithWildcardPermission() {
  try {
    // Find the wildcard permission with pattern '*:*:*'
    const wildcardPermission = await Permission.findOne({ pattern: '*:*:*' })

    if (!wildcardPermission) {
      console.log('Wildcard permission not found.')
      return
    }

    // Find admin roles
    const adminRoles = await Role.find({ isAdmin: true })

    // Update each admin role's permissions list with the wildcard permission
    const updatePromises = adminRoles.map(async (adminRole) => {
      // Clear the existing permissions list
      adminRole.permissions = []

      // Add the wildcard permission to the permissions list
      adminRole.permissions.push(wildcardPermission._id)

      // Save the updated admin role
      await adminRole.save()
    })

    // Wait for all updates to complete
    await Promise.all(updatePromises)

    console.log('Admin roles upadted with wildcard permission successfully.')
  } catch (error) {
    console.error(
      'An error occurred when upadted admin roles with wildcard permission.',
    )
  }
}

module.exports = { insertRoles, assignAdminRolesWithWildcardPermission }
