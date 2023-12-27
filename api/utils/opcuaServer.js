const {
  OPCUAServer,
  Variant,
  DataType,
  StatusCodes,
  makeNodeId,
} = require('node-opcua')

const port = 4334

async function main() {
  const server = new OPCUAServer({
    port,
    resourcePath: '/UADEMO',
  })

  await server.initialize()

  const addressSpace = server.engine.addressSpace
  const namespace = addressSpace.getOwnNamespace()

  const device = namespace.addObject({
    organizedBy: addressSpace.rootFolder.objects,
    browseName: 'MyDevice',
  })

  // Add a read-only variable
  let var1 = 100
  setInterval(() => {
    var1 = Math.random() * 100
    console.log(`var1: ${var1}`)
  }, 1000)

  namespace.addVariable({
    componentOf: device,
    nodeId: 'ns=1;s=1000',
    browseName: 'var1',
    dataType: DataType.Double,
    value: {
      get: () =>
        new Variant({
          dataType: DataType.Double,
          value: var1,
        }),
    },
  })

  // Add a readable and writable variable
  let var2 = 30.0
  namespace.addVariable({
    componentOf: device,
    nodeId: 'ns=1;s="pressure"',
    browseName: 'var2',
    dataType: DataType.Float,
    value: {
      get: () =>
        new Variant({
          dataType: DataType.Float,
          value: var2,
        }),
      set: (variant) => {
        var2 = parseFloat(variant.value)
        return StatusCodes.Good
      },
    },
  })

  server.start(function () {
    console.log('OPC UA server listening on port', port)
  })
}

main()
