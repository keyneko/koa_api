const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const Sensor = require('../models/sensor')
const SensorRecord = require('../models/sensorRecord')
const {
  authenticateMqttClient,
  processMqttSensorData,
  updateSensorOnlineStatus,
} = require('../controllers/mqttController')

const port = 1883

// Connected clients array
let connectedClients = new Map()

// Authenticate clients based on API Key
aedes.authenticate = async (client, username, password, callback) => {
  // client.id is associated with sensorSchema's objectId
  const id = client.id
  const apiKey = password.toString()
  authenticateMqttClient(id, apiKey, callback)
}

// Handle client connect event
aedes.on('client', async (client) => {
  console.log('Client connected:', client.id)

  // Update the sensor's online field to true
  await updateSensorOnlineStatus(client.id, true)

  // Add the client to the connectedClients map
  connectedClients.set(client.id, client)
})

// Handle client disconnect event
aedes.on('clientDisconnect', async (client) => {
  console.log('Client disconnected:', client.id)

  // Update the sensor's online field to false
  await updateSensorOnlineStatus(client.id, false)

  // Remove the client from the connectedClients map
  connectedClients.delete(client.id)
})

// Handle client subscribe event
aedes.on('subscribe', (subscriptions, client) => {
  console.log('Client subscribed to:', subscriptions)

  // Respond to the client with the granted QoS
  aedes.publish({
    topic: '$SYS/' + client.id + '/granted',
    payload: JSON.stringify(subscriptions),
  })
})

// Handle client publish event
aedes.on('publish', async (packet, client) => {
  // Process the status update
  if (packet.topic === 'home/devices/status') {
    console.log(
      `Received from client ${client.id}: `,
      packet.payload.toString(),
    )
    processMqttSensorData(client, packet)
  }
})

// Function to send a message to a client
function sendOnOffCommand(clientId, command) {
  const targetClient = connectedClients.get(clientId)

  if (targetClient) {
    aedes.publish({
      topic: `home/devices/onoff/${clientId}`,
      payload: command,
      qos: 0,
      retain: false,
    })
    console.log(`Sent command '${command}' to client ${clientId}`)
  } else {
    console.log(`Client ${clientId} not found or not connected`)
  }
}

server.listen(port, () => {
  console.log('MQTT server listening on port', port)
})
