// mqttController.js
const aedes = require('aedes')()
const Sensor = require('../models/sensor')
const SensorStatus = require('../models/sensorStatus')
const MessageLog = require('../models/messageLog')
const { mqtt: logger } = require('../utils/logger')

async function authenticate(client, username, password, callback) {
  try {
    const sensorId = client.id
    const apiKey = password.toString()
    const sensor = await Sensor.findById(sensorId)

    if (sensor && sensor.apiKey === apiKey) {
      callback(null, true)
    } else {
      logger.info(
        'MQTT authentication failed: Sensor not found or apiKey error',
      )
      callback(null, false)
    }
  } catch (error) {
    callback(error, false)
    logger.error(error.message)
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

    logger.info(`Status data saved for client ${sensorId}`)
  } catch (error) {
    logger.error('Error processing MQTT client status data: ')
    logger.error(error.message)
  }
}

async function updateOnlineStatus(sensorId, isOnline) {
  try {
    // Update the Sensor model's online field
    await Sensor.findByIdAndUpdate(sensorId, { online: isOnline })
    logger.info(sensorId, isOnline ? 'online' : 'offline')
  } catch (error) {
    logger.error('Error updating sensor online status: ')
    logger.error(error.message)
  }
}

async function onClientConnected(client) {
  logger.info('\n\nClient connected: ' + client.id)
  await updateOnlineStatus(client.id, true)
}

async function onClientDisconnect(client) {
  logger.info('Client disconnected: ' + client.id)
  await updateOnlineStatus(client.id, false)
}

async function onSubscribe(subscriptions, client) {
  logger.info('Client subscribed to: ')
  logger.info(JSON.stringify(subscriptions))

  try {
    const sensor = await Sensor.findById(client.id)
    if (!sensor) {
      logger.error('Sensor not found for client: ' + client.id)
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
    logger.error('Error handling subscribe: ')
    logger.error(error.message)
  }
}

async function onPublish(packet, client) {
  const topic = packet.topic
  logger.info(`Received topic ${topic}`)

  if (client != null || client != undefined) {
    logger.info(`Received from client ${client.id}: `)
    logger.info(packet.payload.toString())

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

    logger.info(`Message log saved for client ${sensorId}`)
  } catch (error) {
    logger.error('Error processing save message log: ')
    logger.error(error.message)
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
