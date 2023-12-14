const Permission = require('../models/permission')
const { logger } = require('../logger')

// Inserting permissions
async function insertPermissions() {
  try {
    const data = [
      {
        name: '角色管理',
        pattern: 'roles:*:*',
        translations: {
          name: {
            en: 'Roles Management',
            ja: 'ロール管理',
          },
        },
      },
      {
        name: '用户管理',
        pattern: 'users:*:*',
        translations: {
          name: {
            en: 'Users Management',
            ja: 'ユーザー管理',
          },
        },
      },
    ]

    const promises = data.map((item) => {
      const permission = new Permission(item)
      return permission.save()
    })

    await Promise.all(promises)

    logger.info('Permissions inserted successfully.')
  } catch (error) {
    logger.error('Error inserting permissions.')
  }
}

module.exports = { insertPermissions }
