const path = require('path')
const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')

// Create the log directory if it doesn't exist
const logDirectory = path.resolve(process.cwd(), 'logs')
require('fs').existsSync(logDirectory) || require('fs').mkdirSync(logDirectory)

// Configure Winston with a transport for daily rotated logs
const logger = winston.createLogger({
  transports: [
    new DailyRotateFile({
      level: 'info',
      filename: path.join(logDirectory, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d', // Retain logs for 14 days
    }),
  ],
})

// Add a console transport for logging to the console during development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  )
}

// Log system startup information
logger.info('= ====================================== =');
logger.info('= System started at: ' + new Date().toLocaleString() + ' =');
logger.info('= Welcome to the application!            =');
logger.info('= ====================================== =');

// Export the configured logger
module.exports = logger
