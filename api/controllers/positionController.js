const Position = require('../models/position')
const {
  getErrorMessage,
  statusCodes,
  statusMessages,
} = require('../statusCodes')

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
    console.error(error)
    throw new Error('Error generating position code')
  }
}

async function getPositions(ctx) {
  try {
    const { pageNum = 1, pageSize = 10, status, isStackable } = ctx.query
    const language = ctx.cookies.get('language')

    const filter = {}
    if (status !== undefined && status !== '') {
      filter.status = status
    }
    if (isStackable !== undefined && isStackable !== '') {
      filter.isStackable = isStackable
    }

    const skip = (pageNum - 1) * pageSize
    const limit = parseInt(pageSize)

    const [positions, total] = await Promise.all([
      Position.find(filter)
        .select(['value', 'name', 'status', 'isStackable', 'files'])
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit),
      Position.countDocuments(filter),
    ])

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: positions,
      total,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function getPosition(ctx) {
  try {
    const { value } = ctx.query
    const language = ctx.cookies.get('language')

    const result = await Position.findOne({ value }).select([
      'value',
      'name',
      'status',
      'isStackable',
      'files',
    ])

    if (!result) {
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
      data: result,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
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

    const value = await generatePosition(areaCode, buildingCode, floorCode)

    const newPosition = new Position({
      value,
      name,
      status,
      isStackable,
      files,
    })
    await newPosition.save()

    ctx.body = {
      code: 200,
      data: value,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function updatePosition(ctx) {
  try {
    const { value } = ctx.request.body
    const language = ctx.cookies.get('language')

    const result = await Position.findOneAndUpdate(
      { value },
      ctx.request.body,
      {
        new: true,
      },
    )

    if (!result) {
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
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function deletePosition(ctx) {
  try {
    const { value } = ctx.query
    const result = await Position.findOneAndDelete({ value })

    if (!result) {
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
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
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
