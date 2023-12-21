// mqttController.js
const aedes = require('aedes')()
const Sensor = require('../models/sensor')
const SensorStatus = require('../models/sensorStatus')
const MessageLog = require('../models/messageLog')

async function authenticate(client, username, password, callback) {
  try {
    const sensorId = client.id
    const apiKey = password.toString()
    const sensor = await Sensor.findById(sensorId)

    if (sensor && sensor.apiKey === apiKey) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  } catch (e) {
    console.error(e.message)
    callback(e, false)
  }
}

async function processStatusData(client, packet) {
  try {
    const sensorId = client.id
    const status = JSON.parse(packet.payload.toString())

    const sensorStatus = new SensorStatus({
      sensorId,
      status,
    })
    await sensorStatus.save()

    console.log(`Status data saved for client ${sensorId}`)
  } catch (error) {
    console.error('Error processing MQTT client status data:', error)
  }
}

async function updateOnlineStatus(sensorId, isOnline) {
  try {
    // Update the Sensor model's online field
    await Sensor.findByIdAndUpdate(sensorId, { online: isOnline })
    console.log(sensorId, isOnline ? 'online' : 'offline')
  } catch (error) {
    console.error('Error updating sensor online status:', error)
  }
}

async function onClientConnected(client) {
  console.log('\nClient connected:', client.id)
  await updateOnlineStatus(client.id, true)
}

async function onClientDisconnect(client) {
  console.log('Client disconnected:', client.id)
  await updateOnlineStatus(client.id, false)
}

async function onSubscribe(subscriptions, client) {
  console.log('Client subscribed to:', subscriptions)

  try {
    const sensor = await Sensor.findById(client.id)
    if (!sensor) {
      console.error('Sensor not found for client:', client.id)
      return
    }

    // Update existing subscriptions or add new ones
    subscriptions.forEach((newSub) => {
      const existingSubIndex = sensor.subscriptions.findIndex(
        (existingSub) => existingSub.topic === newSub.topic,
      )

      if (existingSubIndex !== -1) {
        // Update existing subscription
        sensor.subscriptions[existingSubIndex] = newSub
      } else {
        // Add new subscription
        sensor.subscriptions.push(newSub)
      }
    })

    sensor.markModified('subscriptions')
    await sensor.save()

    // Respond to the client with the granted QoS
    aedes.publish({
      topic: '$SYS/' + client.id + '/granted',
      payload: JSON.stringify(subscriptions),
    })
  } catch (error) {
    console.error('Error handling subscribe:', error)
  }
}

async function onPublish(packet, client) {
  const topic = packet.topic
  console.log(`Received topic ${topic}`)

  if (client != null || client != undefined) {
    console.log(
      `Received from client ${client.id}: `,
      packet.payload.toString(),
    )

    // Receive dht11 sensor status data
    if (topic.startsWith('dht11/status')) {
      processStatusData(client, packet)
    }
  }
}

async function publish(sensorId, packet) {
  try {
    // Publish a message to a client
    aedes.publish({
      qos: 0,
      retain: false,
      ...packet,
    })

    const messageLog = new MessageLog({
      sensorId,
      topic: packet.topic,
      payload: packet.payload,
    })
    await messageLog.save()

    console.log(`Message log saved for client ${sensorId}`)
  } catch (error) {
    console.error('Error processing save message log:', error)
  }
}

module.exports = {
  aedes,
  authenticate,
  onClientConnected,
  onClientDisconnect,
  onSubscribe,
  onPublish,
  publish,
}
