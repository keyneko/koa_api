const Position = require('../models/position')
const { generatePosition } = require('../controllers/positionController')
const { logger } = require('../utils/logger')

// Inserting positions
async function insertPositions() {
  try {
    const data = [
      {
        areaCode: 1,
        buildingCode: 10,
        floorCode: 2,
        name: '金牛座10号楼2层货架',
        translations: {
          name: {
            en: 'Shelves on the 2nd floor of Taurus Building 10',
            ja: 'トーラス10号館2階棚',
          },
        },
      },
      {
        areaCode: 1,
        buildingCode: 10,
        floorCode: 2,
        name: '金牛座10号楼2层货架',
        translations: {
          name: {
            en: 'Shelves on the 2nd floor of Taurus Building 10',
            ja: 'トーラス10号館2階棚',
          },
        },
      },
      {
        areaCode: 1,
        buildingCode: 9,
        floorCode: 'F1',
        name: '金牛座9号楼地下1层货架',
        translations: {
          name: {
            en: 'Shelves on the basement floor of Building 9, Taurus',
            ja: 'タウラス9号館地下1階棚',
          },
        },
      },
      {
        areaCode: 1,
        buildingCode: 9,
        floorCode: 1,
        name: '金牛座9号楼1层货架',
        translations: {
          name: {
            en: 'Shelves on the 1st floor of Taurus Building 9',
            ja: 'トーラス9号館1階棚',
          },
        },
      },
    ]

    for (const item of data) {
      const value = await generatePosition(
        item.areaCode,
        item.buildingCode,
        item.floorCode,
      )
      const position = new Position({
        ...item,
        value,
      })
      await position.save()
    }

    logger.info('Positions inserted successfully.')
  } catch (error) {
    logger.error('Error inserting Positions.')
  }
}

module.exports = { insertPositions }
