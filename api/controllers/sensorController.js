const uuid = require('uuid')
const mongoose = require('mongoose')
const Sensor = require('../models/sensor')
const SensorStatus = require('../models/sensorStatus')
const MessageLog = require('../models/messageLog')
const authController = require('../controllers/authController')
const mqttController = require('../controllers/mqttController')
const { logger } = require('../utils/logger')
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

async function getSensors(ctx) {
  try {
    const { name, type, number, manufacturer, status } = ctx.query
    const language = ctx.cookies.get('language')
    const decoded = ctx.state.decoded
    const createdBy = decoded.userId
    const isAdmin = (decoded.roles || []).some((role) => role.isAdmin)

    const query = {}

    if (!isAdmin) {
      query.$or = [
        { createdBy: createdBy },
        { isPublic: true }
      ];
    }

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
      'apiKey',
      'status',
      'isOnline',
      'isProtected',
      'isPublic',
      'subscriptions',
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
    logger.error(error.message)
  }
}

async function createSensor(ctx) {
  try {
    const { name, number, type, isProtected, isPublic, manufacturer } = ctx.request.body
    const language = ctx.cookies.get('language')
    const decoded = ctx.state.decoded

    // Generate a new API key using uuid
    const apiKey = uuid.v4()

    const newSensor = new Sensor({
      name,
      manufacturer,
      type,
      number,
      apiKey,
      isProtected,
      isPublic,
      createdBy: decoded.userId,
    })

    // Handle translations based on language
    if (language === 'zh' || language === undefined) {
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
    logger.error(error.message)
  }
}

async function updateSensor(ctx) {
  try {
    const { _id, name, number, manufacturer, type, status, isProtected, isPublic } =
      ctx.request.body
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
    if (isProtected !== undefined) sensor.isProtected = isProtected
    if (isPublic !== undefined) sensor.isPublic = isPublic

    await sensor.save()

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

async function deleteSensor(ctx) {
  try {
    const { _id } = ctx.query
    const language = ctx.cookies.get('language')

    const sensor = await validateSensorId(_id)

    if (!sensor) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'sensorNotFound',
      )
      return
    }

    // Check if it is protected
    if (sensor.isProtected) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'protectedSensor',
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
    logger.error(error.message)
  }
}

async function validateSensorId(sensorId) {
  // Validate that sensorId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(sensorId)) {
    return null
  }

  // Validate that the provided sensorId corresponds to an existing Sensor
  const sensor = await Sensor.findById(sensorId)
  if (!sensor) {
    return null
  }

  return sensor
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

    // Set the time to 0:00:00 for the current day
    queryDateTime.setHours(0, 0, 0, 0)

    // Calculate the end time for the current day (23:59:59)
    const endTime = new Date(queryDateTime.getTime() + 24 * 60 * 60 * 1000 - 1)

    // Add a condition to the query to filter records within the current day
    query.createdAt = {
      $gte: queryDateTime,
      $lte: endTime,
    }

    const records = await SensorStatus.find(query)
      .select(['createdAt', 'status'])
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
    logger.error(error.message)
  }
}

async function createRecord(ctx) {
  try {
    const { sensorId, status } = ctx.request.body
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

    const newStatus = new SensorStatus({
      sensorId,
      status,
    })

    await newStatus.save()

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
}

async function publishMessage(ctx) {
  try {
    const { _id, qos, retain, topic, payload } = ctx.request.body
    const language = ctx.cookies.get('language')

    const sensor = await validateSensorId(_id)

    if (!sensor) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'sensorNotFound',
      )
      return
    }

    // Push messages to client
    mqttController.publish(_id, {
      qos,
      retain,
      topic,
      payload,
    })

    const messageLog = new MessageLog({
      sensorId: _id,
      topic,
      payload,
      qos,
      isOnline: sensor.isOnline,
    })

    await messageLog.save()
    logger.info(`Message log saved for client ${_id}`)

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
  getSensors,
  createSensor,
  updateSensor,
  deleteSensor,
  publishMessage,
  getRecords,
  createRecord,
}
