// socket.js
const socketIO = require('socket.io')
const { verifyToken } = require('../controllers/authController')

const connectedClients = new Map()

function initializeSocket(server) {
  const io = socketIO(server)

  io.on('connection', async (socket) => {
    const token = socket.handshake.auth.token

    const decoded = await verifyToken(token)
    if (!decoded) {
      socket.disconnect()
      console.error('Authentication failed: Invalid token', socket.id)
      return
    }

    console.log('Client connected:', socket.id)

    connectedClients.set(socket.id, {
      userId: decoded.userId,
      socket: socket,
    })

    // Add the logic after connection here
    socket.on('joinRoom', (data) => {
      console.log('Received:', data)

      socket.emit('message', 'Hello, client!')
    })

    // Triggered when client disconnects
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)

      // Removed from Map when client disconnects
      connectedClients.delete(socket.id)
    })
  })

  return io
}

// // 通过 connectedClients Map 对象可以向特定客户端发送消息
// function sendMessageToClient(clientId, event, data) {
//   const client = connectedClients.get(clientId);
//   if (client && client.socket) {
//     client.socket.emit(event, data);
//   }
// }

module.exports = { initializeSocket }
