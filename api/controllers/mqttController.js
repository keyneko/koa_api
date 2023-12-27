// mqttController.js
const aedes = require('aedes')()
const Sensor = require('../models/sensor')
const SensorStatus = require('../models/sensorStatus')
const { mqtt: logger } = require('../utils/logger')
const { broadcastMessage } = require('../utils/socket')

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

      callback(
        {
          returnCode: 4,
          returnMessage: 'Authentication failed',
        },
        false,
      )
    }
  } catch (error) {
    callback(error, false)
    logger.error(error.message)
  }
}

async function processDht11Data(client, packet) {
  try {
    const sensorId = client.id
    const payload = packet.payload.toString()
    let status

    try {
      status = JSON.parse(payload)
    } catch (error) {
      status = payload
    }

    const sensorStatus = new SensorStatus({
      sensorId,
      status,
    })
    await sensorStatus.save()

    broadcastMessage('newSensorDataArrived', payload)

    logger.info(`Status data saved for client ${sensorId}`)
  } catch (error) {
    logger.error('Error processing MQTT client status data: ')
    logger.error(error.message)
  }
}

async function processRgbLedData(client, packet) {
  try {
    const sensorId = client.id
    const payload = packet.payload.toString()
    const status = payload

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
    // Update the Sensor model's isOnline field
    const result = await Sensor.findByIdAndUpdate(sensorId, { isOnline })
    logger.info(sensorId + ' ' + (isOnline ? 'online' : 'offline'))
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
        sensor.markModified('subscriptions')
      }
    })

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

async function onUnsubscribe(subscriptions, client) {
  logger.info('Client unsubscribed to: ')
  logger.info(JSON.stringify(subscriptions))

  try {
    const sensor = await Sensor.findById(client.id)
    if (!sensor) {
      logger.error('Sensor not found for client: ' + client.id)
      return
    }

    // Remove subscriptions
    subscriptions.forEach((unsubscribeTopic) => {
      const existingSubIndex = sensor.subscriptions.findIndex(
        (existingSub) => existingSub.topic === unsubscribeTopic,
      )

      if (existingSubIndex !== -1) {
        // Remove existing subscription
        sensor.subscriptions.splice(existingSubIndex, 1)
        sensor.markModified('subscriptions')
      }
    })

    await sensor.save()
  } catch (error) {
    logger.error('Error handling unsubscribe: ')
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
      processDht11Data(client, packet)
    }

    // Receive rgb led sensor status data
    if (topic.startsWith('rgb_led/status')) {
      processRgbLedData(client, packet)
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
  } catch (error) {
    logger.error('Error publish data to client: ')
    logger.error(error.message)
  }
}

module.exports = {
  aedes,
  authenticate,
  onClientConnected,
  onClientDisconnect,
  onSubscribe,
  onUnsubscribe,
  onPublish,
  publish,
}
