const path = require('path')
const Koa = require('koa')
const { koaBody } = require('koa-body')
const koaStatic = require('koa-static')
const compress = require('koa-compress')
const mongoose = require('mongoose')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const fileRoutes = require('./routes/fileRoutes')
const barcodeRoutes = require('./routes/barcodeRoutes')
const dictionaryRoutes = require('./routes/dictionaryRoutes')

const app = new Koa()
const PORT = process.env.PORT || 4000
const MONGODB_URI = 'mongodb://localhost:27017/test'

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// 静态文件服务
app.use(koaStatic(path.join(process.cwd(), '/public')))

app.use(compress())

// Middleware
app.use(
  koaBody({
    multipart: true,
    formidable: {
      // 是否保留拓展名
      keepExtensions: true,
      // 限制文件大小
      maxFieldsSize: 5 * 1024 * 1024,
    },
  }),
)

// Routes
app.use(authRoutes.routes())
app.use(userRoutes.routes())
app.use(fileRoutes.routes())
app.use(barcodeRoutes.routes())
app.use(dictionaryRoutes.routes())

require('./sqls')

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
