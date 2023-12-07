const bcrypt = require('bcrypt')
const User = require('../models/user')

// Inserting users
async function insertUsers() {
  try {
    const data = [
      { username: 'admin', password: '123456', name: '管理员', roles: [] },
      { username: 'keyneko', password: '123456', name: '平民', roles: [] },
    ]

    const promises = data.map(async (item) => {
      // Hash the password
      const hashedPassword = await bcrypt.hash(item.password, 10)

      // Create a new user
      const user = new User({
        username: item.username,
        password: hashedPassword,
        name: item.name,
        roles: item.roles,
      })
      return user.save()
    })

    await Promise.all(promises)

    console.log('Users inserted successfully.')
  } catch (error) {
    console.error('Error inserting users.', error)
  }
}

module.exports = { insertUsers }
