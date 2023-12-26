// socket.js
const socketIO = require('socket.io')
const { verifyToken } = require('../controllers/authController')
const { socket: logger } = require('../utils/logger')

const connectedClients = new Map()
let io = null

function initializeSocket(server) {
  io = socketIO(server)

  io.on('connection', async (socket) => {
    const token = socket.handshake.auth.token

    const decoded = await verifyToken(token)
    if (!decoded) {
      socket.disconnect()
      logger.error('Authentication failed: Invalid token, ' + socket.id)
      return
    }

    logger.info('Client connected: ' + socket.id)

    connectedClients.set(socket.id, {
      userId: decoded.userId,
      socket: socket,
    })

    // Add the logic after connection here
    socket.on('joinRoom', (data) => {
      logger.info('Received: ')
      logger.info(data)

      socket.emit('message', 'Hello, client!')
    })

    // Triggered when client disconnects
    socket.on('disconnect', () => {
      logger.info('Client disconnected: ' + socket.id)

      // Removed from Map when client disconnects
      connectedClients.delete(socket.id)
    })
  })
}

function broadcastMessage(name, data) {
  if (io) {
    logger.info('Broadcast message for : ' + name)
    logger.info(data)

    io.emit(name, data)
  }
}

// // 通过 connectedClients Map 对象可以向特定客户端发送消息
// function sendMessageToClient(clientId, event, data) {
//   const client = connectedClients.get(clientId);
//   if (client && client.socket) {
//     client.socket.emit(event, data);
//   }
// }

module.exports = { initializeSocket, broadcastMessage }
