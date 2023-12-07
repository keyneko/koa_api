const Position = require('../models/position')
const { statusCodes } = require('../statusCodes')

// Function to generate a position code
async function generatePositionCode(areaCode, buildingCode, floorCode) {
  try {
    // Format the components
    const formattedAreaCode = areaCode.toString().padStart(4, '0')
    const formattedBuildingCode = buildingCode.toString().padStart(2, '0')
    const formattedFloorCode = floorCode.toString().padStart(2, '0')

    // Use the aggregation pipeline to find the last generated position code for the specified area, building, and floor
    const lastPosition = await Position.aggregate([
      {
        $match: {
          position: {
            $regex: `^KW${formattedAreaCode}${formattedBuildingCode}${formattedFloorCode}`, // Match the start of the position field
          },
        },
      },
      {
        $sort: {
          position: -1, // Sort in descending order based on position
        },
      },
      {
        $limit: 1,
      },
    ])

    console.log('Aggregation Result:', lastPosition)

    // Extract the last incremental number or set it to 0 if no previous positions exist
    const lastIncrementalNumber =
      lastPosition.length > 0 ? parseInt(lastPosition[0].position.substr(-4), 10) : 0

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

module.exports = {
  generatePositionCode,
}
