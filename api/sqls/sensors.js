const uuid = require('uuid')
const Sensor = require('../models/sensor')
const { logger } = require('../utils/logger')

// Inserting sensors
async function insertSensors() {
  try {
    // Generate a new API key using uuid
    const apiKey = uuid.v4()

    const data = [
      {
        name: '宿舍温湿度計',
        type: 0,
        apiKey: 'a971705e-599f-467c-84c0-8ab0fe0c0aa7',
        isProtected: true,
        translations: {
          name: {
            en: 'Dormitory Thermohygrometer',
            ja: '寮の温湿度計',
          },
        },
      },
    ]

    const promises = data.map((item) => {
      const sensor = new Sensor(item)
      return sensor.save()
    })

    await Promise.all(promises)

    logger.info('Sensors inserted successfully.')
  } catch (error) {
    logger.error('Error inserting Sensors.')
  }
}

module.exports = { insertSensors }
