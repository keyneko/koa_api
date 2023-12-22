const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const svgCaptcha = require('svg-captcha')
const User = require('../models/user')
const Sensor = require('../models/sensor')
const TokenBlacklist = require('../models/tokenBlacklist')
const { logger } = require('../utils/logger')
const { decryptPassword } = require('../utils/rsa')
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

const secretKey = 'your-secret-key'

// Store captcha code and corresponding captcha code ID
const captchaStore = {}

// Regularly clear expired captcha codes
async function cleanupExpiredCaptcha() {
  const now = Date.now()
  for (const [captchaId, { text, timestamp }] of Object.entries(captchaStore)) {
    if (now - timestamp > 5 * 60 * 1000) {
      logger.info(`captcha expired: ${text}`)
      // Captcha codes older than 5 minutes will be cleared
      delete captchaStore[captchaId]
    }
  }
}
setInterval(cleanupExpiredCaptcha, 60 * 1000) // Check every minute
cleanupExpiredCaptcha()

// Regularly clear the Token blacklist
async function cleanupTokenBlacklist() {
  const expirationThreshold = new Date()
  expirationThreshold.setDate(expirationThreshold.getDate() - 3)

  try {
    // Remove entries older than the expiration threshold
    await TokenBlacklist.deleteMany({ createdAt: { $lt: expirationThreshold } })
  } catch (error) {
    logger.error('Token blacklist cleanup error:')
    logger.error(error.message)
  }
}
setInterval(cleanupTokenBlacklist, 24 * 60 * 60 * 1000) // Check every 24 hours
cleanupTokenBlacklist()

function generateToken(user) {
  const payload = {
    userId: user._id,
    username: user.username,
    roles: user.roles,
  }

  // Sign the JWT token
  return jwt.sign(payload, secretKey, { expiresIn: '72h' }) // Adjust the expiration time as needed
}

function verifyToken(token) {
  try {
    return jwt.verify(token, secretKey)
  } catch (error) {
    return null
  }
}

// Verify whether the captcha code matches
function validateCaptcha(captcha, captchaId) {
  const storedCaptcha = captchaStore[captchaId]
  let isValid = true
  if (!storedCaptcha || storedCaptcha.text !== captcha.toLowerCase()) {
    isValid = false
  }
  // Clear verification code
  delete captchaStore[captchaId]
  return isValid
}

// Middleware to check if the request has a valid token
const hasToken = async (ctx, next) => {
  const token = ctx.headers.authorization
  const language = ctx.cookies.get('language')

  if (!token) {
    ctx.status = statusCodes.Unauthorized
    ctx.body = getErrorMessage(
      statusCodes.Unauthorized,
      language,
      'missingToken',
    )
    return
  }

  const decoded = await verifyToken(token)
  if (!decoded) {
    ctx.status = statusCodes.Unauthorized
    ctx.body = getErrorMessage(
      statusCodes.Unauthorized,
      language,
      'invalidToken',
    )
    return
  }

  // Attach the decoded information to the context state for further use
  ctx.state.decoded = decoded

  await next()
}

// Middleware to check if the user is an admin
const isAdmin = async (ctx, next) => {
  const token = ctx.headers.authorization
  const language = ctx.cookies.get('language')
  const decoded = await verifyToken(token)

  if (!decoded || !decoded.roles.some((role) => role.isAdmin)) {
    ctx.status = statusCodes.Forbidden
    ctx.body = getErrorMessage(statusCodes.Forbidden, language, 'adminOnly')
    return
  }

  // Attach the decoded information to the context state for further use
  ctx.state.decoded = decoded

  await next()
}

const hasApiKey = async (ctx, next) => {
  const { apikey, authorization: token } = ctx.headers
  const { sensorId } = ctx.request.body
  const language = ctx.cookies.get('language')

  if (!token) {
    // Token is not present, check for API key
    if (apikey) {
      const sensor = await Sensor.findById(sensorId)

      if (sensor && sensor.apiKey === apikey) {
        // API key is valid and sensor is active, proceed to the next middleware or route
        await next()
      } else {
        ctx.status = statusCodes.Unauthorized
        ctx.body = getErrorMessage(
          statusCodes.Unauthorized,
          language,
          'invalidApiKey',
        )
      }
    } else {
      ctx.status = statusCodes.Unauthorized
      ctx.body = getErrorMessage(
        statusCodes.Unauthorized,
        language,
        'missingApiKey',
      )
    }
  } else {
    await next()
  }
}

function captcha(ctx) {
  const captcha = svgCaptcha.create({
    ignoreChars: '0oOQ1iIlft',
    color: true,
    noise: 2,
  })
  const captchaId = Date.now().toString()

  logger.info(`captcha generated: ${captcha.text} ${captchaId}`)

  captchaStore[captchaId] = {
    text: captcha.text.toLowerCase(),
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
  try {
    const { username, password, captcha, captchaId } = ctx.request.body
    const language = ctx.cookies.get('language')

    // Verify whether the captcha code is correct
    if (!validateCaptcha(captcha, captchaId)) {
      ctx.status = statusCodes.InvalidCaptcha
      ctx.body = getErrorMessage(statusCodes.InvalidCaptcha, language)
      return
    }

    // Check if the username already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      ctx.status = statusCodes.UserExists
      ctx.body = getErrorMessage(statusCodes.UserExists, language)
      return
    }

    // Decrypt the encrypted password
    const decryptedPassword = decryptPassword(password)

    // Hash the password
    const hashedPassword = await bcrypt.hash(decryptedPassword, 10)

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
    })

    // Save the user to the database
    await newUser.save()

    ctx.status = 200
    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
}

async function login(ctx) {
  try {
    const { username, password, captcha, captchaId } = ctx.request.body
    const language = ctx.cookies.get('language')

    // Verify whether the captcha code is correct
    if (!validateCaptcha(captcha, captchaId)) {
      ctx.status = statusCodes.InvalidCaptcha
      ctx.body = getErrorMessage(statusCodes.InvalidCaptcha, language)
      return
    }

    // Find the user in the database
    const user = await User.findOne({ username }).populate({
      path: 'roles',
      select: 'isAdmin',
    })

    // Check if the user exists and verify the password
    if (user) {
      // Decrypt the encrypted password
      const decryptedPassword = decryptPassword(password)

      if (await bcrypt.compare(decryptedPassword, user.password)) {
        const token = generateToken(user) // Generate JWT

        ctx.status = 200
        ctx.body = {
          code: 200,
          token,
        }
      } else {
        ctx.status = statusCodes.PasswordError
        ctx.body = getErrorMessage(statusCodes.PasswordError, language)
      }
    } else {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'userNotFound')
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
}

async function logout(ctx) {
  const token = ctx.headers.authorization
  const language = ctx.cookies.get('language')

  try {
    // Check if the token is already in the blacklist
    const isTokenBlacklisted = await TokenBlacklist.findOne({ token })

    if (isTokenBlacklisted) {
      ctx.status = statusCodes.Unauthorized
      ctx.body = getErrorMessage(
        statusCodes.Unauthorized,
        language,
        'invalidToken',
      )
      return
    }

    // Add the token to the blacklist
    const tokenToBlacklist = new TokenBlacklist({ token })
    await tokenToBlacklist.save()

    ctx.status = 200
    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
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
  hasApiKey,
}
