const Router = require('koa-router')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const svgCaptcha = require('svg-captcha')

const authRouter = new Router()
const secretKey = 'your-secret-key' // Replace with a secure key for signing JWT

// 存储验证码文本和对应的验证码ID的对象
const captchaStore = {}

// 定时清理过期验证码
setInterval(() => {
  const now = Date.now()
  for (const [captchaId, { text, timestamp }] of Object.entries(captchaStore)) {
    if (now - timestamp > 5 * 60 * 1000) {
      console.log(`captcha expired: ${text}`)
      // 超过5分钟的验证码将被清理
      delete captchaStore[captchaId]
    }
  }
}, 60 * 1000) // 每分钟检查一次

authRouter.get('/captcha', async (ctx) => {
  const captcha = svgCaptcha.create()
  const captchaId = Date.now().toString()

  console.log(`captcha generated: ${captcha.text} ${captchaId}`)

  captchaStore[captchaId] = {
    text: captcha.text.toLowerCase(), // 存储验证码文本，转为小写以方便后续验证
    timestamp: Date.now(),
  }

  ctx.type = 'svg'
  ctx.body = {
    captchaId,
    captcha: captcha.data,
  }
})

authRouter.post('/register', async (ctx) => {
  const { username, password, captcha, captchaId } = ctx.request.body

  // 验证验证码是否匹配
  const storedCaptcha = captchaStore[captchaId]
  if (!storedCaptcha || storedCaptcha.text !== captcha.toLowerCase()) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: 'Invalid captcha',
    }
    return
  }
  // 清除验证码
  delete captchaStore[captchaId]

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      ctx.status = 409 // Conflict
      ctx.body = {
        code: 409,
        message: 'Username already exists',
      }
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
    })

    // Save the user to the database
    await newUser.save()

    const token = generateToken(newUser) // Generate JWT

    ctx.status = 201 // Created
    ctx.body = {
      code: 200,
      message: 'Registration successful',
      token,
    }
  } catch (error) {
    ctx.status = 500 // Internal Server Error
    ctx.body = {
      code: 500,
      message: 'An error occurred during registration',
    }
  }
})

authRouter.post('/login', async (ctx) => {
  const { username, password, captcha, captchaId } = ctx.request.body

  // 验证验证码是否匹配
  const storedCaptcha = captchaStore[captchaId]
  if (!storedCaptcha || storedCaptcha.text !== captcha.toLowerCase()) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: 'Invalid captcha',
    }
    return
  }
  // 清除验证码
  delete captchaStore[captchaId]

  try {
    // Find the user in the database
    const user = await User.findOne({ username })

    // Check if the user exists and verify the password
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user) // Generate JWT

      ctx.status = 200 // OK
      ctx.body = {
        code: 200,
        message: 'Login successful',
        token,
      }
    } else {
      ctx.status = 401 // Unauthorized
      ctx.body = {
        code: 401,
        message: 'Invalid credentials',
      }
    }
  } catch (error) {
    ctx.status = 500 // Internal Server Error
    ctx.body = {
      code: 500,
      message: 'An error occurred during login',
    }
  }
})

function generateToken(user) {
  const payload = {
    userId: user._id,
    username: user.username,
  }

  // Sign the JWT token
  return jwt.sign(payload, secretKey, { expiresIn: '1h' }) // Adjust the expiration time as needed
}

module.exports = authRouter
