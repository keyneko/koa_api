// mqttController.js
const Sensor = require('../models/sensor')
const SensorRecord = require('../models/sensorRecord')

async function authenticateMqttClient(sensorId, apiKey, callback) {
  try {
    // Check if the API Key is valid and map to a client ID
    const sensor = await Sensor.findById(sensorId)

    if (sensor && sensor.apiKey === apiKey) {
      callback(null, true)
    } else {
      console.info(
        'MQTT authentication failed: Sensor not found or apiKey error',
      )
      callback(null, false)
    }
  } catch (e) {
    console.error(e.message)
    callback(e, false)
  }
}

async function processMqttSensorData(client, packet) {
  try {
    const sensorId = client.id // Assuming client.id is associated with sensorSchema's objectId
    const value = JSON.parse(packet.payload.toString())

    // Create a new sensor record
    const sensorRecord = new SensorRecord({
      sensorId,
      value,
    })

    // Save the sensor record to the database
    await sensorRecord.save()

    console.log(`Sensor data saved for sensor ${sensorId}`)
  } catch (error) {
    console.error('Error processing MQTT sensor data:', error)
  }
}

async function updateSensorOnlineStatus(sensorId, isOnline) {
  try {
    // Update the Sensor model's online field
    await Sensor.findByIdAndUpdate(sensorId, { online: isOnline })
    console.log(
      `Sensor online status updated for sensor ${sensorId}: ${isOnline}`,
    )
  } catch (error) {
    console.error('Error updating sensor online status:', error)
  }
}

module.exports = {
  authenticateMqttClient,
  processMqttSensorData,
  updateSensorOnlineStatus,
}
