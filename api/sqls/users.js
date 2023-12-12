const bcrypt = require('bcrypt')
const User = require('../models/user')

// Inserting users
async function insertUsers() {
  try {
    const data = [
      {
        username: 'admin',
        password: '123456',
        name: '超级管理员',
        roles: [0], // Administrator Role
        translations: {
          en: 'Super Admin',
          ja: 'スーパー管理者',
        },
      },
      {
        username: 'keyneko',
        password: '123456',
        name: '流水线操作工',
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

    console.log('Users inserted successfully.')
  } catch (error) {
    console.error('Error inserting users.')
  }
}

module.exports = { insertUsers }
