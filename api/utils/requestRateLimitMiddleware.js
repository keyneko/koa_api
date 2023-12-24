// requestRateLimitMiddleware.js
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

// Store the timestamp of the last request
const lastRequestTimestamps = new Map()

// Set time windows (milliseconds) based on request methods
const timeWindows = {
  GET: 400,
  POST: 2000,
  PUT: 2000,
  DELETE: 2000,
}

// List of URLs to be excluded
const excludedUrls = [
  // '/captcha',
  // '/user',
]

// Request rate-limiting middleware
const requestRateLimit = async (ctx, next) => {
  const url = ctx.originalUrl // Get the request URL
  const method = ctx.method // Get the request method
  const language = ctx.cookies.get('language')

  // Check if it's an excluded URL
  if (excludedUrls.includes(url)) {
    await next()
    return
  }

  // Get the timestamp of the last request
  const lastTimestamp = lastRequestTimestamps.get(url)

  // Get the time window
  const timeWindow = timeWindows[method] || 1000 // Default time window is 1000 milliseconds

  // If there was a request within the time window, return an error
  if (lastTimestamp && Date.now() - lastTimestamp < timeWindow) {
    ctx.status = statusCodes.TooManyRequests
    ctx.body =
      getErrorMessage(statusCodes.TooManyRequests, language) + ': ' + url
    return
  }

  // Record the timestamp of the current request
  lastRequestTimestamps.set(url, Date.now())

  await next()
}

module.exports = requestRateLimit
