const Role = require('../models/role')

// Inserting roles
async function insertRoles() {
  try {
    const data = [
      {
        name: '管理员',
        value: 0,
        sops: [0, 1], // Roles、Users Management Sops
        translations: {
          en: 'Administrator',
          ja: '管理者',
        },
      },
      {
        name: '仓管员',
        value: 1,
        sops: [],
        translations: {
          en: 'Warehouse Keeper',
          ja: '倉庫管理人',
        },
      },
      {
        name: '质检员',
        value: 2,
        sops: [],
        translations: {
          en: 'Quality Inspector',
          ja: '品質検査員',
        },
      },
      {
        name: '生产员',
        value: 3,
        sops: [],
        translations: {
          en: 'Production Worker',
          ja: '生産作業員',
        },
      },
      {
        name: '巡检员',
        value: 4,
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

    console.log('Roles inserted successfully.')
  } catch (error) {
    console.error('Error inserting roles.')
  }
}

module.exports = { insertRoles }
