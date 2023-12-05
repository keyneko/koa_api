const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const svgCaptcha = require('svg-captcha')
const User = require('../models/user')
const TokenBlacklist = require('../models/tokenBlacklist')

const secretKey = 'your-secret-key' // Replace with a secure key for signing JWT

// 存储验证码文本和对应的验证码ID的对象
const captchaStore = {}

// 定时清理过期验证码
async function cleanupExpiredCaptcha() {
  const now = Date.now()
  for (const [captchaId, { text, timestamp }] of Object.entries(captchaStore)) {
    if (now - timestamp > 5 * 60 * 1000) {
      console.log(`captcha expired: ${text}`)
      // 超过5分钟的验证码将被清理
      delete captchaStore[captchaId]
    }
  }
}
setInterval(cleanupExpiredCaptcha, 60 * 1000) // 每分钟检查一次

// 定期清理Token黑名单
async function cleanupTokenBlacklist() {
  const expirationThreshold = new Date()
  expirationThreshold.setDate(expirationThreshold.getDate() - 7)

  try {
    // Remove entries older than the expiration threshold
    await TokenBlacklist.deleteMany({ createdAt: { $lt: expirationThreshold } })
  } catch (error) {
    console.error('Token blacklist cleanup error:', error)
  }
}
setInterval(cleanupTokenBlacklist, 24 * 60 * 60 * 1000) // 24 hours

function generateToken(user) {
  const payload = {
    userId: user._id,
    username: user.username,
  }

  // Sign the JWT token
  return jwt.sign(payload, secretKey, { expiresIn: '24h' }) // Adjust the expiration time as needed
}

function verifyToken(token) {
  try {
    return jwt.verify(token, secretKey)
  } catch (error) {
    return null
  }
}

// Middleware to check if the request has a valid token
const hasToken = async (ctx, next) => {
  const token = ctx.headers.authorization
  if (!token) {
    ctx.status = 401
    ctx.body = 'Unauthorized: Missing token'
    return
  }

  const decoded = await verifyToken(token)
  if (!decoded) {
    ctx.status = 401
    ctx.body = 'Unauthorized: Invalid token'
    return
  }

  // Attach the decoded information to the context state for further use
  ctx.state.decoded = decoded

  await next()
}

// Middleware to check if the user is an admin
const isAdmin = async (ctx, next) => {
  const token = ctx.headers.authorization
  const decoded = await verifyToken(token)

  if (!decoded || decoded.username !== 'admin') {
    ctx.status = 403
    ctx.body = 'Permission denied'
    return
  }

  // Attach the decoded information to the context state for further use
  ctx.state.decoded = decoded

  await next()
}

function captcha(ctx) {
  const captcha = svgCaptcha.create({
    ignoreChars: '0o1ilLft',
    color: true,
    noise: 2,
  })
  const captchaId = Date.now().toString()

  console.log(`captcha generated: ${captcha.text} ${captchaId}`)

  captchaStore[captchaId] = {
    text: captcha.text.toLowerCase(), // 存储验证码文本，转为小写以方便后续验证
    timestamp: Date.now(),
  }

  ctx.status = 200
  ctx.body = {
    code: 200,
    captchaId,
    captcha: captcha.data,
  }
}

async function register(ctx) {
  const { username, password, captcha, captchaId } = ctx.request.body

  // 验证验证码是否匹配
  const storedCaptcha = captchaStore[captchaId]
  if (!storedCaptcha || storedCaptcha.text !== captcha.toLowerCase()) {
    ctx.status = 501
    ctx.body = '无效的验证码'
    return
  }
  // 清除验证码
  delete captchaStore[captchaId]

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      ctx.status = 502
      ctx.body = '用户名已存在'
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

    ctx.status = 200
    ctx.body = {
      code: 200,
      message: '注册成功',
      token,
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = 'Internal Server Error'
  }
}

async function login(ctx) {
  const { username, password, captcha, captchaId } = ctx.request.body

  // 验证验证码是否匹配
  const storedCaptcha = captchaStore[captchaId]
  if (!storedCaptcha || storedCaptcha.text !== captcha.toLowerCase()) {
    ctx.status = 501
    ctx.body = '无效的验证码'
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

      ctx.status = 200
      ctx.body = {
        code: 200,
        message: '登录成功',
        token,
      }
    } else {
      ctx.status = 503
      ctx.body = '帐号或密码有误'
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = '服务器发生错误'
  }
}

async function logout(ctx) {
  const token = ctx.headers.authorization

  try {
    // Check if the token is already in the blacklist
    const isTokenBlacklisted = await TokenBlacklist.findOne({ token })

    if (isTokenBlacklisted) {
      ctx.status = 401
      ctx.body = 'Unauthorized: Token has already been invalidated'
      return
    }

    // Add the token to the blacklist
    const tokenToBlacklist = new TokenBlacklist({ token })
    await tokenToBlacklist.save()

    ctx.status = 200
    ctx.body = {
      code: 200,
      message: '登出成功',
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = '服务器发生错误'
  }
}

module.exports = {
  captcha,
  register,
  login,
  logout,
  generateToken,
  hasToken,
  isAdmin,
}
