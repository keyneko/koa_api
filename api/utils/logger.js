const path = require('path')
const moment = require('moment')
const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')

// Create the log directory if it doesn't exist
const logDirectory = path.resolve(process.cwd(), 'logs')

// Create the log directory if it doesn't exist
require('fs').mkdirSync(logDirectory, { recursive: true })

// Log output format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}`,
  ),
)

// Configure Winston with a transport for daily rotated logs
const transports = (filename) => [
  new DailyRotateFile({
    level: 'info',
    filename: path.join(logDirectory, moment().format('YYYY-MM'), filename),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false, // Log files older than maxFiles will be compressed into a zip archive
    handleExceptions: true, // Capturing and logging unexpected errors
    json: false, // Makes the log entries more human-readable
    maxSize: '20m',
    maxFiles: '14d', // Retain logs for 14 days
  }),
]

const logger = winston.createLogger({
  format,
  transports: transports('application-%DATE%.log'),
})

const frontend = winston.createLogger({
  format,
  transports: transports('frontend-%DATE%.log'),
})

const mqtt = winston.createLogger({
  format,
  transports: transports('mqtt-%DATE%.log'),
})

const socket = winston.createLogger({
  format,
  transports: transports('socket-%DATE%.log'),
})

// Add a console transport for logging to the console during development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format }))
  mqtt.add(new winston.transports.Console({ format }))
  // socket.add(new winston.transports.Console({ format }))
}

// Log system startup information
logger.info('= ====================================== =')
logger.info('= System started at: ' + new Date().toLocaleString() + ' =')
logger.info('= Welcome to the application!            =')
logger.info('= ====================================== =')

// Export the configured logger
module.exports = { logger, frontend, mqtt, socket }
