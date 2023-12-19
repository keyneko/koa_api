const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://localhost:1883', {
  clientId: '65797384bc3bbe7aee214060',
  username: '',
  password: '25b589f8-30ee-4426-8f00-7d921910ff07', // Set your API key as the password
})

client.on('connect', () => {
  console.log('Connected to MQTT server')

  // Subscribe to the topic
  client.subscribe('home/devices/onoff')
  client.subscribe('home/devices/onoff/' + client.options.clientId)
})

client.on('message', (topic, message) => {
  console.log(`Received message from topic ${topic}: ${message.toString()}`)

  // Broadcast
  if (topic === 'home/devices/onoff') {
    const value = message.toString()

    if (value === '1') {
      console.log('Open the relay')
    } else if (value === '0') {
      console.log('Close the relay')
    } else {
      console.log('Invalid value')
    }
  }

  // Unicast
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

// Simulate sending a message to the server every 5 seconds
setInterval(() => {
  client.publish('home/devices/status', '1')
}, 5000)
