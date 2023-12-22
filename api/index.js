const path = require('path')
const Koa = require('koa')
const dotenv = require('dotenv')
const { koaBody } = require('koa-body')
const koaStatic = require('koa-static')
const compress = require('koa-compress')
const mongoose = require('mongoose')
const logRoutes = require('./routes/logRoutes')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const roleRoutes = require('./routes/roleRoutes')
const permissionRoutes = require('./routes/permissionRoutes')
const fileRoutes = require('./routes/fileRoutes')
const barcodeRoutes = require('./routes/barcodeRoutes')
const positionRoutes = require('./routes/positionRoutes')
const dictionaryRoutes = require('./routes/dictionaryRoutes')
const sensorRoutes = require('./routes/sensorRoutes')

// Load environment variables from the appropriate file based on the NODE_ENV
const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: envFile })

const app = new Koa()
const PORT = process.env.PORT || 4000
const MONGODB_URI = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/test`

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Configuring static file service
app.use(koaStatic(path.join(process.cwd(), '/public')))

app.use(compress())

// Middleware
app.use(
  koaBody({
    multipart: true,
    formidable: {
      // Whether to keep the extension
      keepExtensions: true,
      // Limit upload file size
      maxFileSize: 5 * 1024 * 1024,
    }
  }),
)

// Set routes
app.use(logRoutes.routes())
app.use(authRoutes.routes())
app.use(userRoutes.routes())
app.use(roleRoutes.routes())
app.use(permissionRoutes.routes())
app.use(fileRoutes.routes())
app.use(barcodeRoutes.routes())
app.use(positionRoutes.routes())
app.use(dictionaryRoutes.routes())
app.use(sensorRoutes.routes())

require('./sqls')
require('./utils/mqttServer')

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
