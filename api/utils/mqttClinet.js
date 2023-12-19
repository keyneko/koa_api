const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://localhost:1883') // Replace 'localhost' with your server address

client.on('connect', () => {
  console.log('Connected to MQTT server')

  // Subscribe to the topic
  client.subscribe('home/devices/onoff')
  client.subscribe('home/devices/onoff/' + client.options.clientId)
})

client.on('message', (topic, message) => {
  console.log(`Received message from topic ${topic}: ${message.toString()}`)

  if (topic === 'home/devices/onoff/') {
    const value = message.toString()

    if (value === '1') {
      console.log('Open the relay')
    } else if (value === '0') {
      console.log('Close the relay')
    } else {
      console.log('Invalid value')
    }
  }

  if (topic === 'home/devices/onoff/' + client.options.clientId) {
    const value = message.toString()

    if (value === '1') {
      console.log('Open the relay')
    } else if (value === '0') {
      console.log('Close the relay')
    } else {
      console.log('Invalid value')
    }
  }
})

client.on('error', (error) => {
  console.error('MQTT client error:', error)
})

client.on('close', () => {
  console.log('Connection to MQTT server closed')
})

// // Simulate sending a message to the server every 5 seconds
// setInterval(() => {
//   client.publish('home/devices/heartbeat/')
// }, 5000)
