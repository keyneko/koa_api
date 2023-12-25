const Position = require('../models/position')
const { logger } = require('../utils/logger')
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

// Function to generate a position code
async function generatePosition(areaCode, buildingCode, floorCode) {
  try {
    // Format the components
    const formattedAreaCode = areaCode.toString().padStart(4, '0')
    const formattedBuildingCode = buildingCode.toString().padStart(2, '0')
    const formattedFloorCode = floorCode.toString().padStart(2, '0')

    // Use the aggregation pipeline to find the last generated position code for the specified area, building, and floor
    const lastPosition = await Position.aggregate([
      {
        $match: {
          value: {
            $regex: `^KW${formattedAreaCode}${formattedBuildingCode}${formattedFloorCode}`, // Match the start of the position field
          },
        },
      },
      {
        $sort: {
          value: -1, // Sort in descending order based on value
        },
      },
      {
        $limit: 1,
      },
    ])

    // console.log('Aggregation Result:', lastPosition)

    // Extract the last incremental number or set it to 0 if no previous positions exist
    const lastIncrementalNumber =
      lastPosition.length > 0
        ? parseInt(lastPosition[0].value.substr(-4), 10)
        : 0

    // Calculate the next incremental number
    const formattedIncrementalNumber = (lastIncrementalNumber + 1)
      .toString()
      .padStart(4, '0')

    // Combine components to form the position code
    const positionCode = `KW${formattedAreaCode}${formattedBuildingCode}${formattedFloorCode}${formattedIncrementalNumber}`

    return positionCode
  } catch (error) {
    // Handle any errors that may occur during the database query
    logger.error(error.message)
    throw new Error('Error generating position code')
  }
}

async function getPositions(ctx) {
  try {
    const { pageNum = 1, pageSize = 10, status, isStackable } = ctx.query
    const language = ctx.cookies.get('language')
    const decoded = ctx.state.decoded
    const createdBy = decoded.userId
    const isAdmin = (decoded.roles || []).some((role) => role.isAdmin)

    const filter = {}
    if (status !== undefined && status !== '') {
      filter.status = status
    }
    if (isStackable !== undefined && isStackable !== '') {
      filter.isStackable = isStackable
    }
    if (!isAdmin) {
      filter.createdBy = createdBy
    }

    const skip = (pageNum - 1) * pageSize
    const limit = parseInt(pageSize)

    const [positions, total] = await Promise.all([
      Position.find(filter)
        .select([
          'value',
          'name',
          'isStackable',
          'status',
          'isProtected',
          'files',
          'translations',
        ])
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit),
      Position.countDocuments(filter),
    ])

    // Map over the positions to retrieve translated values
    const mappedPositions = positions.map((position) => ({
      ...position.toObject(),
      name: position.translations?.name?.[language] || position.name,
    }))

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: mappedPositions,
      total,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
}

async function getPosition(ctx) {
  try {
    const { value } = ctx.query
    const language = ctx.cookies.get('language')

    const position = await Position.findOne({ value }).select([
      'value',
      'name',
      'isStackable',
      'status',
      'isProtected',
      'files',
      'translations',
    ])

    if (!position) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'positionNotFound',
      )
      return
    }
    ctx.body = {
      code: 200,
      data: {
        ...position.toObject(),
        name: position.translations?.name?.[language] || position.name,
      },
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
}

async function createPosition(ctx) {
  try {
    const {
      areaCode,
      buildingCode,
      floorCode,
      name,
      status,
      isStackable,
      files,
    } = ctx.request.body
    const language = ctx.cookies.get('language')
    const decoded = ctx.state.decoded

    const value = await generatePosition(areaCode, buildingCode, floorCode)

    const newPosition = new Position({
      name,
      value,
      status,
      isStackable,
      files,
      createdBy: decoded.userId,
    })

    // Handle translations based on the language value
    if (language === 'zh' || language === undefined) {
    } else {
      // Use $set to add translations
      newPosition.$set('translations', {
        name: {
          [language]: name,
        },
      })
    }

    await newPosition.save()

    ctx.body = {
      code: 200,
      data: value,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
}

async function updatePosition(ctx) {
  try {
    const { value, isProtected } = ctx.request.body
    const updateData = { ...ctx.request.body }
    const language = ctx.cookies.get('language')

    const position = await Position.findOne({ value })

    if (!position) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'positionNotFound',
      )
      return
    }

    // Update default fields for 'zh' or undefined language
    if (language === 'zh' || language === undefined) {
      position.name = updateData.name || position.name
    } else {
      // Update translations based on the specified language
      if ('name' in updateData) {
        position.translations.name = {
          ...(position.translations.name || {}),
          [language]: updateData.name,
        }
      }
    }

    // Mark the modified fields to ensure they are saved
    position.markModified('translations')

    if (updateData.status !== undefined) position.status = updateData.status
    if (updateData.isStackable !== undefined)
      position.isStackable = updateData.isStackable
    position.files = updateData.files || position.files
    if (isProtected !== undefined) position.isProtected = isProtected

    await position.save()

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
}

async function deletePosition(ctx) {
  try {
    const { value } = ctx.query
    const language = ctx.cookies.get('language')

    const position = await Position.findOne({ value })
    if (!position) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'positionNotFound',
      )
      return
    }

    // Check if it is protected
    if (position.isProtected) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'protectedPosition',
      )
      return
    }

    await Position.findOneAndDelete({ value })

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
  generatePosition,
  getPositions,
  getPosition,
  createPosition,
  updatePosition,
  deletePosition,
}
