const {
  insertRoles,
  assignAdminRolesWithWildcardPermission,
} = require('./roles')
const { insertUsers, assignAdminRoleToUser } = require('./users')
const { insertPermissions } = require('./permission')
const { insertBarcodes } = require('./barcodes')
const { insertPositions } = require('./positions')
const { insertDictionaries } = require('./dictionaries')

// Execute the functions in sequence using async/await
async function executeSqls() {
  try {
    // Insert permission entries
    await insertPermissions()

    // Insert roles
    await insertRoles()

    // Insert users
    await insertUsers()

    // Assign the admin role to the admin user
    await assignAdminRoleToUser()
    await assignAdminRolesWithWildcardPermission()

    // Insert dictionaries
    insertDictionaries()

    // // Insert barcodes
    // insertBarcodes()

    // // Insert positions
    // insertPositions()
  } catch (error) {
    console.error('An error occurred while inserting sql data:', error)
  }
}

executeSqls()
