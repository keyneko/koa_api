const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const Sensor = require('../models/sensor')
const port = 1883

// Connected clients array
let connectedClients = new Map()

// Authenticate clients based on API Key
aedes.authenticate = async (client, username, password, callback) => {
  const id = client.id
  const apiKey = password.toString()

  try {
    // Check if the API Key is valid and map to a client ID
    const sensor = await Sensor.findById(id)

    if (sensor && sensor.apiKey === apiKey) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  } catch (e) {
    callback(e, false)
  }
}

// Handle client connect event
aedes.on('client', (client) => {
  console.log('Client connected:', client.id)

  // Add the client to the connectedClients map
  connectedClients.set(client.id, client)

  // Example: Sending '1' to the newly connected client
  setInterval(() => {
    // sendOnOffCommand(client.id, '1')

    aedes.publish({
      topic: `home/devices/onoff/${client.id}`,
      payload: '1',
      qos: 0,
      retain: false,
    })
  }, 5000)
})

// Handle client disconnect event
aedes.on('clientDisconnect', (client) => {
  console.log('Client disconnected:', client.id)

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
aedes.on('publish', (packet, client) => {
  if (packet.topic === 'home/devices/status') {
    console.log(
      'Received status update from client',
      client.id,
      ':',
      packet.payload.toString(),
    )
    // Process the status update
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
