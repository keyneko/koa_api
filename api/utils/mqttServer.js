const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const port = 1883

const HEARTBEAT_INTERVAL = 5000 // 5 seconds

// Handle client connect event
aedes.on('client', (client) => {
  console.log('Client connected:', client.id)

  aedes.publish({
    topic: 'home/devices/onoff/' + client.id,
    payload: '1',
    qos: 0,
    retain: false,
  })
  console.log('Send command to client:', client.id)
})

// Handle client disconnect event
aedes.on('clientDisconnect', (client) => {
  console.log('Client disconnected:', client.id)
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
  if (packet.topic === 'home/devices/status/') {
    console.log(
      'Received status update from client',
      client.id,
      ':',
      packet.payload.toString(),
    )
    // Process the status update
  }

  if (packet.topic === 'home/devices/heartbeat/') {
    console.log('Received client heartbeat: ', client.id)

    // Update the heartbeat status for the client
    heartbeats.set(client.id, Date.now())
  }
})

server.listen(port, () => {
  console.log('MQTT server listening on port', port)
})

// Check client heartbeat connections
setInterval(() => {
  const currentTime = Date.now()

  // Iterate through the heartbeats Map
  for (const [clientId, lastHeartbeatTime] of heartbeats) {
    // Check if the client has not sent a heartbeat within the specified interval
    if (currentTime - lastHeartbeatTime > HEARTBEAT_INTERVAL * 2) {
      console.log('Client lost heartbeat connection:', clientId)

      // Remove the client from the heartbeats Map or take appropriate action
      heartbeats.delete(clientId)
    }
  }
}, HEARTBEAT_INTERVAL)

// Heartbeat to check client connection status
let heartbeats = new Map()
