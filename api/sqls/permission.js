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
        isProtected: true,
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
        isProtected: true,
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
        isProtected: true,
        translations: {
          name: {
            en: 'Users Management',
            ja: 'ユーザー管理',
          },
        },
      },

      // Dictionaries
      {
        name: '字典词条',
        pattern: 'dictionaries:*:*',
        isProtected: true,
        translations: {
          name: {
            en: 'Dictionaries',
            ja: '辞書エントリ',
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
        name: '条码查询',
        pattern: 'barcodes:query:*',
        translations: {
          name: {
            en: 'Barcodes Query',
            ja: 'バーコードクエリー',
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
      {
        name: '条码生成',
        pattern: 'barcodes:management:create',
        translations: {
          name: {
            en: 'Barcode Create',
            ja: 'バーコード生成',
          },
        },
      },
      {
        name: '条码删除',
        pattern: 'barcodes:management:delete',
        translations: {
          name: {
            en: 'Barcode Delete',
            ja: 'バーコード削除',
          },
        },
      },
      {
        name: '条码更新',
        pattern: 'barcodes:management:update',
        translations: {
          name: {
            en: 'Barcode Update',
            ja: 'バーコード更新',
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
        name: '库位码查询',
        pattern: 'positions:query:*',
        translations: {
          name: {
            en: 'Positions Query',
            ja: 'ポジションコードクエリー',
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
      {
        name: '库位码生成',
        pattern: 'positions:management:create',
        translations: {
          name: {
            en: 'Position Create',
            ja: 'ポジションコード生成',
          },
        },
      },
      {
        name: '库位码删除',
        pattern: 'positions:management:delete',
        translations: {
          name: {
            en: 'Position Delete',
            ja: 'ポジションコード削除',
          },
        },
      },
      {
        name: '库位码更新',
        pattern: 'positions:management:update',
        translations: {
          name: {
            en: 'Position Update',
            ja: 'ポジションコード更新',
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
      {
        name: '传感器生成',
        pattern: 'sensors:management:create',
        translations: {
          name: {
            en: 'Sensor Create',
            ja: 'センサー生成',
          },
        },
      },
      {
        name: '传感器删除',
        pattern: 'sensors:management:delete',
        translations: {
          name: {
            en: 'Sensor Delete',
            ja: 'センサー削除',
          },
        },
      },
      {
        name: '传感器更新',
        pattern: 'sensors:management:update',
        translations: {
          name: {
            en: 'Sensor Update',
            ja: 'センサー更新',
          },
        },
      },
      {
        name: '传感器推送消息',
        pattern: 'sensors:management:publish',
        translations: {
          name: {
            en: 'Sensor Publish',
            ja: 'センサープッシュ',
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
