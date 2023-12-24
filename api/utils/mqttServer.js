const {
  aedes,
  authenticate,
  onClientConnected,
  onClientDisconnect,
  onSubscribe,
  onUnsubscribe,
  onPublish,
} = require('../controllers/mqttController')
const server = require('net').createServer(aedes.handle)
const { mqtt: logger } = require('../utils/logger')

const port = 1883

// Authenticate clients based on API Key
aedes.authenticate = authenticate

// Handle client connect event
aedes.on('client', onClientConnected)

// Handle client disconnect event
aedes.on('clientDisconnect', onClientDisconnect)

// Handle client subscribe event
aedes.on('subscribe', onSubscribe)

// Handle client unsubscription event
aedes.on('unsubscribe', onUnsubscribe)

// Handle client publish event
aedes.on('publish', onPublish)

server.listen(port, () => {
  logger.info('MQTT server listening on port', port)
})
