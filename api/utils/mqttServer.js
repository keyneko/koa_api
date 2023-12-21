const {
  aedes,
  authenticate,
  onClientConnected,
  onClientDisconnect,
  onSubscribe,
  onPublish,
} = require('../controllers/mqttController')
const server = require('net').createServer(aedes.handle)

const port = 1883

// Authenticate clients based on API Key
aedes.authenticate = authenticate

// Handle client connect event
aedes.on('client', onClientConnected)

// Handle client disconnect event
aedes.on('clientDisconnect', onClientDisconnect)

// Handle client subscribe event
aedes.on('subscribe', onSubscribe)

// Handle client publish event
aedes.on('publish', onPublish)

server.listen(port, () => {
  console.log('MQTT server listening on port', port)
})
