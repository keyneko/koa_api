const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const svgCaptcha = require('svg-captcha')
const User = require('../models/user')

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

function generateToken(user) {
  const payload = {
    userId: user._id,
    username: user.username,
  }

  // Sign the JWT token
  return jwt.sign(payload, secretKey, { expiresIn: '1h' }) // Adjust the expiration time as needed
}

function captcha(ctx) {
  const captcha = svgCaptcha.create()
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
    ctx.status = 200
    ctx.body = {
      code: 501,
      message: '无效的验证码',
    }
    return
  }
  // 清除验证码
  delete captchaStore[captchaId]

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      ctx.status = 200
      ctx.body = {
        code: 502,
        message: '用户名已存在',
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

    ctx.status = 200
    ctx.body = {
      code: 200,
      message: '注册成功',
      token,
    }
  } catch (error) {
    ctx.status = 200
    ctx.body = {
      code: 500,
      message: '服务器发生错误',
    }
  }
}

async function login(ctx) {
  const { username, password, captcha, captchaId } = ctx.request.body

  // 验证验证码是否匹配
  const storedCaptcha = captchaStore[captchaId]
  if (!storedCaptcha || storedCaptcha.text !== captcha.toLowerCase()) {
    ctx.status = 200
    ctx.body = {
      code: 501,
      message: '无效的验证码',
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

      ctx.status = 200
      ctx.body = {
        code: 200,
        message: '登录成功',
        token,
      }
    } else {
      ctx.status = 200
      ctx.body = {
        code: 503,
        message: '帐号或密码有误',
      }
    }
  } catch (error) {
    ctx.status = 200
    ctx.body = {
      code: 500,
      message: '服务器发生错误',
    }
  }
}

module.exports = {
  captcha,
  register,
  login,
}
