const bcrypt = require('bcrypt')
const Role = require('../models/role')
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
        isProtected: true,
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
        isProtected: true,
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

async function assignAdminRoleToUser() {
  try {
    // Find the role with name 'isAdmin'
    const adminRole = await Role.findOne({ isAdmin: true })

    if (!adminRole) {
      console.log('Role with name "isAdmin" not found.')
      return
    }

    // Find the user with username 'admin' and update roles array
    const user = await User.findOneAndUpdate(
      { username: 'admin' },
      { roles: [adminRole._id] }, // Set the roles array with the new role
      { new: true }, // Return the updated document
    )

    if (user) {
      console.log('Role added to the user successfully.')
    } else {
      console.log('User with username "admin" not found.')
    }
  } catch (error) {
    console.error('Error assigning admin role to user:', error.message)
  }
}

module.exports = { insertUsers, assignAdminRoleToUser }
