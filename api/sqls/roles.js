const Role = require('../models/role')
const { logger } = require('../utils/logger')

// Inserting roles
async function insertRoles() {
  try {
    const data = [
      {
        name: '系统管理员',
        value: "admin",
        isAdmin: true,
        sops: [],
        permissions: [],
        translations: {
          en: 'Administrator',
          ja: 'システム管理者',
        },
      },
      {
        name: '仓管员',
        value: "warehouse keeper",
        sops: [],
        translations: {
          en: 'Warehouse Keeper',
          ja: '倉庫管理者',
        },
      },
      {
        name: '质检员',
        value: "quality inspector",
        sops: [],
        translations: {
          en: 'Quality Inspector',
          ja: '品質検査員',
        },
      },
      {
        name: '生产员',
        value: "production worker",
        sops: [],
        translations: {
          en: 'Production Worker',
          ja: '生産作業員',
        },
      },
      {
        name: '巡检员',
        value: "patrol inspector",
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

module.exports = { insertRoles }
