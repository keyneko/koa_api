// mqttController.js
const aedes = require('aedes')()
const Sensor = require('../models/sensor')
const SensorRecord = require('../models/sensorRecord')

// Connected clients array
let connectedClients = new Map()

async function authenticateMqttClient(client, username, password, callback) {
  try {
    const sensorId = client.id
    const apiKey = password.toString()
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
    const sensorId = client.id
    const value = JSON.parse(packet.payload.toString())

    const sensorRecord = new SensorRecord({
      sensorId,
      value,
    })

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

async function onClientConnected(client) {
  console.log('Client connected:', client.id)

  // Update the sensor's online field to true
  await updateSensorOnlineStatus(client.id, true)

  // Add the client to the connectedClients map
  connectedClients.set(client.id, client)
}

async function onClientDisconnect(client) {
  console.log('Client disconnected:', client.id)

  // Update the sensor's online field to false
  await updateSensorOnlineStatus(client.id, false)

  // Remove the client from the connectedClients map
  connectedClients.delete(client.id)
}

async function onSubscribe(subscriptions, client) {
  console.log('Client subscribed to:', subscriptions)

  // Respond to the client with the granted QoS
  aedes.publish({
    topic: '$SYS/' + client.id + '/granted',
    payload: JSON.stringify(subscriptions),
  })
}

async function onPublish(packet, client) {
  // Process the status update
  if (packet.topic === 'home/devices/status') {
    console.log(
      `Received from client ${client.id}: `,
      packet.payload.toString(),
    )
    processMqttSensorData(client, packet)
  }
}

// Function to publish a message to a client
async function publishMessage(clientId, topic, value) {
  const targetClient = connectedClients.get(clientId)

  if (targetClient) {
    aedes.publish({
      topic: `${topic}/${clientId}`,
      payload: JSON.stringify(value),
      qos: 0,
      retain: false,
    })

    console.log(`Published message to topic '${topic}' for client ${clientId}`)
  } else {
    console.log(`Client ${clientId} not found or not connected`)
  }
}

module.exports = {
  aedes,
  authenticateMqttClient,
  onClientConnected,
  onClientDisconnect,
  onSubscribe,
  onPublish,
  publishMessage,
}
