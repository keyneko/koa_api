const Position = require('../models/position')
const { generatePosition } = require('../controllers/positionController')

// Inserting positions
async function insertPositions() {
  try {
    const data = [
      { name: '金牛座10号楼2层货架', areaCode: 1, buildingCode: 10, floorCode: 2 },
      { name: '金牛座10号楼2层货架', areaCode: 1, buildingCode: 10, floorCode: 2 },
      { name: '金牛座10号楼2层货架', areaCode: 1, buildingCode: 10, floorCode: 2 },
      { name: '金牛座9号楼负1层货架', areaCode: 1, buildingCode: 9, floorCode: 'f1' },
      { name: '金牛座9号楼1层货架', areaCode: 1, buildingCode: 9, floorCode: 1 },
    ]

    for (const item of data) {
      const value = await generatePosition(
        item.areaCode,
        item.buildingCode,
        item.floorCode,
      )
      const position = new Position({
        value,
        name: item.name,
        isStackable: 1,
        status: 1,
        options: { 尺寸: '20cmx20cmx60cm' },
      })
      await position.save()
    }

    console.log('Positions inserted successfully.')
  } catch (error) {
    console.error('Error inserting Positions.', error)
  }
}

module.exports = { insertPositions }
