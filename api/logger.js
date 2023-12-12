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
const logger = winston.createLogger({
  format,
  transports: [
    new DailyRotateFile({
      level: 'info',
      filename: path.join(
        logDirectory,
        moment().format('YYYY-MM'),
        'application-%DATE%.log',
      ),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      handleExceptions: true,
      json: false,
      maxSize: '20m',
      maxFiles: '14d', // Retain logs for 14 days
    }),
  ],
})

// Add a console transport for logging to the console during development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format }))
}

// Log system startup information
logger.info('= ====================================== =')
logger.info('= System started at: ' + new Date().toLocaleString() + ' =')
logger.info('= Welcome to the application!            =')
logger.info('= ====================================== =')

// Export the configured logger
module.exports = logger
