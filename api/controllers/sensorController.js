const mongoose = require('mongoose')
const Sensor = require('../models/Sensor')
const SensorRecord = require('../models/SensorRecord')
const authController = require('../controllers/authController')
const { logger } = require('../utils/logger')
const {
  getErrorMessage,
  statusCodes,
  statusMessages,
} = require('../utils/statusCodes')

async function getSensors(ctx) {
  try {
    const { name, type, number, manufacturer, status } = ctx.query
    const language = ctx.cookies.get('language')

    const query = {}

    // Fuzzy search for name (case-insensitive)
    if (name !== undefined && name !== '') {
      if (language === 'zh' || language === undefined) {
        query.name = { $regex: new RegExp(name, 'i') }
      } else {
        query['translations.name.' + language] = {
          $regex: new RegExp(name, 'i'),
        }
      }
    }

    if (type !== undefined && type !== '') {
      query.type = type
    }

    // Fuzzy search for number (case-insensitive)
    if (number !== undefined && number !== '') {
      query.number = { $regex: new RegExp(number, 'i') }
    }

    if (manufacturer !== undefined && manufacturer !== '') {
      if (language === 'zh' || language === undefined) {
        query.manufacturer = { $regex: new RegExp(manufacturer, 'i') }
      } else {
        query['translations.manufacturer.' + language] = {
          $regex: new RegExp(manufacturer, 'i'),
        }
      }
    }

    if (status !== undefined && status !== '') {
      query.status = status
    }

    const sensors = await Sensor.find(query).select([
      'name',
      'type',
      'number',
      'manufacturer',
      'status',
      'translations',
    ])

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: sensors.map((sensor) => ({
        ...sensor.toObject(),
        name: sensor.translations?.name?.[language] || sensor.name,
        manufacturer:
          sensor.translations?.manufacturer?.[language] || sensor.manufacturer,
        translations: undefined,
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
      type,
      number,
    })

    // Handle translations based on language
    if (language === 'zh' || language === undefined) {
      newSensor.name = name
      newSensor.manufacturer = manufacturer
    } else {
      // Use $set to add translations
      newSensor.$set('translations', {
        name: {
          [language]: name,
        },
        manufacturer: {
          [language]: manufacturer,
        },
      })
    }

    await newSensor.save()

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function updateSensor(ctx) {
  try {
    const { _id, name, number, manufacturer, type, status } = ctx.request.body
    const language = ctx.cookies.get('language')

    const sensor = await Sensor.findById(_id)
    if (!sensor) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'sensorNotFound',
      )
      return
    }

    // Update default fields for 'zh' or undefined language
    if (language === 'zh' || language === undefined) {
      sensor.name = name || sensor.name
      sensor.manufacturer = manufacturer
    } else {
      // Update translations based on the specified language
      if (name) {
        sensor.translations.name = {
          ...(sensor.translations.name || {}),
          [language]: name,
        }
      }

      if (manufacturer !== undefined) {
        sensor.translations.manufacturer = {
          ...(sensor.translations.manufacturer || {}),
          [language]: manufacturer,
        }
      }

      // Mark the modified fields to ensure they are saved
      sensor.markModified('translations')
    }

    if (type !== undefined) sensor.type = type
    if (number !== undefined) sensor.number = number
    if (status !== undefined) sensor.status = status

    await sensor.save()

    ctx.status = 200
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
    const { _id } = ctx.query
    const language = ctx.cookies.get('language')

    if (!(await validateSensorId(_id))) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'sensorNotFound',
      )
      return
    }

    const result = await Sensor.findByIdAndDelete(_id)
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
  updateSensor,
  deleteSensor,
  getRecords,
  createRecord,
}
