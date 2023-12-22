// socket.js
const socketIO = require('socket.io')
const { verifyToken } = require('../controllers/authController')

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

    // Add the logic after connection here
    socket.on('joinRoom', (data) => {
      console.log('Received:', data)

      socket.emit('message', 'Hello, client!')
    })
  })

  return io
}

module.exports = { initializeSocket }
