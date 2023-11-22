const Koa = require('koa')
const { koaBody } = require('koa-body')
const mongoose = require('mongoose')
const authRoutes = require('./routes/authRoutes')
const blogRoutes = require('./routes/blogRoutes')

const app = new Koa()
const PORT = process.env.PORT || 3000
const MONGODB_URI = 'mongodb://localhost:27017/test'

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// Middleware
app.use(
  koaBody({
    multipart: true,
    formidable: { maxFieldsSize: 5 * 1024 * 1024 },
  }),
)

// Routes
app.use(authRoutes.routes())
app.use(blogRoutes.routes())

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
