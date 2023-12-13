const mongoose = require('mongoose')
const Sensor = require('../models/Sensor')
const SensorRecord = require('../models/SensorRecord')
const authController = require('../controllers/authController')
const { logger } = require('../logger')
const {
  getErrorMessage,
  statusCodes,
  statusMessages,
} = require('../statusCodes')

async function getSensors(ctx) {
  try {
    const { type, manufacturer, status } = ctx.query
    const language = ctx.cookies.get('language')

    const query = {}
    if (type !== undefined && type !== '') {
      query.type = type
    }
    if (manufacturer !== undefined && manufacturer !== '') {
      query.manufacturer = manufacturer
    }
    if (status !== undefined && status !== '') {
      query.status = status
    }

    const sensors = await Sensor.find(query).select([
      'name',
      'number',
      'type',
      'manufacturer',
      'status',
    ])

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: sensors.map((sensor) => ({
        ...sensor.toObject(),
      })),
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function createSensor(ctx) {
  try {
    const { name, number, type, manufacturer } = ctx.request.body
    const language = ctx.cookies.get('language')

    const newSensor = new Sensor({
      name,
      number,
      type,
      manufacturer,
    })

    await newSensor.save()

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function deleteSensor(ctx) {
  try {
    const { id } = ctx.query
    const language = ctx.cookies.get('language')

    if (!(await validateSensorId(id))) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'sensorNotFound',
      )
      return
    }

    const result = await Sensor.findByIdAndDelete(id)
    if (!result) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'sensorNotFound',
      )
      return
    }

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function validateSensorId(sensorId) {
  // Validate that sensorId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(sensorId)) {
    return false
  }

  // Validate that the provided sensorId corresponds to an existing Sensor
  const sensor = await Sensor.findById(sensorId)
  if (!sensor) {
    return false
  }

  return true
}

async function getRecords(ctx) {
  try {
    const { sensorId, sortBy = '_id', sortOrder = 'asc', dateTime } = ctx.query
    const language = ctx.cookies.get('language')

    if (!(await validateSensorId(sensorId))) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'sensorNotFound',
      )
      return
    }

    const sortOptions = {
      [sortBy]: sortOrder === 'desc' ? -1 : 1,
    }

    const query = { sensorId }

    // Convert the provided dateTime to a JavaScript Date object
    const queryDateTime = dateTime ? new Date(dateTime) : new Date()

    // Calculate the start time for the past 24 hours
    const startTime = new Date(queryDateTime.getTime() - 24 * 60 * 60 * 1000)

    // Add a condition to the query to filter records within the past 24 hours
    query.createdAt = {
      $gte: startTime,
      $lte: queryDateTime,
    }

    const records = await SensorRecord.find(query)
      .select(['createdAt', 'value'])
      .sort(sortOptions)

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: records.map((record) => ({
        ...record.toObject(),
        _id: undefined,
      })),
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

    if (!(await validateSensorId(sensorId))) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'sensorNotFound',
      )
      return
    }

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
  getSensors,
  createSensor,
  deleteSensor,
  getRecords,
  createRecord,
}
