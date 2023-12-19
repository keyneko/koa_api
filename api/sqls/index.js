const {
  insertRoles,
  assignAdminRolesWithWildcardPermission,
} = require('./roles')
const { insertUsers, assignAdminRoleToUser } = require('./users')
const { insertPermissions } = require('./permission')
const { insertBarcodes } = require('./barcodes')
const { insertPositions } = require('./positions')
const { insertDictionaries } = require('./dictionaries')
const { insertSensors } = require('./sensors')

// Execute the functions in sequence using async/await
async function executeSqls() {
  try {
    await insertPermissions()
    await insertRoles()
    await insertUsers()

    // Assign the admin role to the admin user
    await assignAdminRoleToUser()
    await assignAdminRolesWithWildcardPermission()

    insertDictionaries()
    insertSensors()
    // insertBarcodes()
    // insertPositions()
  } catch (error) {
    console.error('An error occurred while inserting sql data:', error)
  }
}

executeSqls()
