const bcrypt = require('bcrypt')
const User = require('../models/user')
const { logger } = require('../utils/logger')

// Inserting users
async function insertUsers() {
  try {
    const data = [
      {
        username: 'admin',
        password: '123456',
        name: '超级管理员',
        roles: [], // Administrator Role
        translations: {
          en: 'Super Admin',
          ja: 'スーパー管理者',
        },
      },
      {
        username: 'keyneko',
        password: '123456',
        name: '搬运工',
        roles: [],
        translations: {
          en: 'Brick Carrier',
          ja: 'ボトムポーター',
        },
      },
    ]

    const promises = data.map(async (item) => {
      // Hash the password
      const hashedPassword = await bcrypt.hash(item.password, 10)

      // Create a new user
      const user = new User({
        ...item,
        password: hashedPassword,
      })
      return user.save()
    })

    await Promise.all(promises)

    logger.info('Users inserted successfully.')
  } catch (error) {
    logger.error('Error inserting users.')
  }
}

module.exports = { insertUsers }
