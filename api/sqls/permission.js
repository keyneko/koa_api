const Permission = require('../models/permission')
const { logger } = require('../utils/logger')

// Inserting permissions
async function insertPermissions() {
  try {
    const data = [
      // Wildcard, all permissions
      {
        name: '管理员权限',
        description: '通配权限，这是最大权限了',
        pattern: '*:*:*',
        translations: {
          name: {
            en: 'Administrator Permissions',
            ja: '管理者権限',
          },
          description: {
            en: 'Wildcard permissions, this is the maximum permission',
            ja: 'ワイルドカード権限。これが最大権限です',
          },
        },
      },

      // Roles
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

      // Users
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

      // Barcodes
      {
        name: '条码',
        pattern: 'barcodes:*:*',
        translations: {
          name: {
            en: 'Barcodes',
            ja: 'バーコード',
          },
        },
      },
      {
        name: '条码生成',
        pattern: 'barcodes:create:*',
        translations: {
          name: {
            en: 'Barcode Generate',
            ja: 'バーコード生成',
          },
        },
      },
      {
        name: '条码管理',
        pattern: 'barcodes:management:*',
        translations: {
          name: {
            en: 'Barcodes Management',
            ja: 'バーコード管理',
          },
        },
      },

      // Positions
      {
        name: '库位码',
        pattern: 'positions:*:*',
        translations: {
          name: {
            en: 'Positions',
            ja: 'ポジションコード',
          },
        },
      },
      {
        name: '库位码生成',
        pattern: 'positions:create:*',
        translations: {
          name: {
            en: 'Position Generate',
            ja: 'ポジションコード生成',
          },
        },
      },
      {
        name: '库位码管理',
        pattern: 'positions:management:*',
        translations: {
          name: {
            en: 'Positions Management',
            ja: 'ポジションコード管理',
          },
        },
      },

      // Sensors
      {
        name: '传感器模块',
        pattern: 'sensors:*:*',
        translations: {
          name: {
            en: 'Sensors',
            ja: 'センサー',
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
