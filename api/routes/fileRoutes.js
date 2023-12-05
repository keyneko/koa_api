const fs = require('fs')
const path = require('path')
const Router = require('koa-router')
const fileRouter = new Router()
const File = require('../models/file')
const authController = require('../controllers/authController')

const projectRoot = process.cwd()

// Upload file
fileRouter.post('/upload', authController.hasToken, async (ctx) => {
  try {
    const { file } = ctx.request.files

    if (!file) {
      ctx.status = 400
      ctx.body = 'No file provided for upload'
      return
    }

    // Get the current date
    const currentDate = new Date()

    // Create subdirectories for the year and month
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const uploadDir = path.join(projectRoot, `/public/uploads/${year}/${month}`)

    // Ensure the directories exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Use the original filename
    const fileName = file.newFilename
    const filePath = path.join(uploadDir, fileName)

    // Move the file to the specified directory
    fs.renameSync(file.filepath, filePath)

    // Extract the path relative to the public directory
    const relativePath = path
      .relative(path.join(projectRoot, 'public'), filePath)
      .replace(/\\/g, '/')

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: `${ctx.origin}/${relativePath}`,
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500
    ctx.body = 'Internal Server Error'
  }
})

module.exports = fileRouter
