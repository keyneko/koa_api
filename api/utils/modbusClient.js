const ModbusRTU = require('modbus-serial')
const client = new ModbusRTU()

const networkErrors = [
  'ESOCKETTIMEDOUT',
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'EHOSTUNREACH',
]

client
  .connectTCP('127.0.0.1', { port: 8502 })
  .then(setClient)
  .then(function () {
    console.log('Connected')
  })
  .catch(function (e) {
    if (e.errno) {
      if (networkErrors.includes(e.errno)) {
        console.log('we have to reconnect')
      }
    }
    console.log(e.message)
  })

function setClient() {
  // set the client's unit id
  client.setID(1)
  client.setTimeout(1000)

  // run program
  readRegisters()
}

// read the 4 registers starting at address 5
function readRegisters() {
  client
    .readHoldingRegisters(5, 4)
    .then(function (d) {
      console.log('Receive:', d.data)
    })
    .catch(function (e) {
      console.log(e.message)
    })
    .then(readCoils)
}

function readCoils() {
  client
    .readCoils(1, 20)
    .then(function (d) {
      console.log('Receive:', d.data)
    })
    .catch(function (e) {
      console.log(e.message)
    })
    .then(readDeviceIdentification)
}

function readDeviceIdentification() {
  client
    .readDeviceIdentification(1)
    .then(function (d) {
      console.log('Receive:', d.data)
    })
    .catch(function (e) {
      console.log(e.message)
    })
    .then(close)
}

function close() {
  client.close()
}
