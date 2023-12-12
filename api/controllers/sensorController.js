const SensorRecord = require('../models/SensorRecord')
const authController = require('../controllers/authController')
const { logger } = require('../logger')
const {
  getErrorMessage,
  statusCodes,
  statusMessages,
} = require('../statusCodes')

async function getRecords(ctx) {
  try {
    const { sortBy = '_id', sortOrder = 'desc' /* asc */ } = ctx.query
    const language = ctx.cookies.get('language')

    const sortOptions = {
      [sortBy]: sortOrder === 'desc' ? -1 : 1,
    }

    const records = await SensorRecord.find()
      .select(['createdAt', 'sensorId', 'sensorName', 'value'])
      .sort(sortOptions)

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: records,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function createRecord(ctx) {
  try {
    const { dateTime, sensorId, sensorName, value } = ctx.request.body
    const language = ctx.cookies.get('language')

    // Convert the dateTime string to a Date object
    const createdAt = new Date(dateTime)

    const newRecord = new SensorRecord({
      createdAt,
      sensorId,
      sensorName,
      value,
    })

    await newRecord.save()

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

module.exports = {
  getRecords,
  createRecord,
}
