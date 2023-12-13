const Dictionary = require('../models/dictionary')
const { logger } = require('../logger')

// Inserting barcode status dictionaries
async function insertBarcodeStatus() {
  try {
    const data = [
      {
        key: 'barcode_status',
        value: 0,
        name: '默认',
        translations: {
          en: 'Default',
          ja: 'デフォルト',
        },
      },
      {
        key: 'barcode_status',
        value: 1,
        name: '在库',
        translations: {
          en: 'In stock',
          ja: '在庫あり',
        },
      },
      {
        key: 'barcode_status',
        value: 2,
        name: '在途',
        translations: {
          en: 'In transit',
          ja: '途中で',
        },
      },
      {
        key: 'barcode_status',
        value: 3,
        name: '已报废',
        translations: {
          en: 'Scrapped',
          ja: '廃棄された',
        },
      },
      {
        key: 'barcode_status',
        value: 4,
        name: '已报失',
        translations: {
          en: 'Lost',
          ja: '失った',
        },
      },
    ]

    const promises = data.map((item) => {
      const dictionary = new Dictionary(item)
      return dictionary.save()
    })

    await Promise.all(promises)

    logger.info('Barcode status dictionaries inserted successfully.')
  } catch (error) {
    logger.error('Error inserting barcode status dictionaries.')
  }
}

// Inserting position stackable dictionaries
async function insertPositionStackable() {
  try {
    const data = [
      {
        key: 'position_stackable',
        value: 0,
        name: '不可堆叠',
        translations: {
          en: 'Not stackable',
          ja: 'スタッキング不可',
        },
      },
      {
        key: 'position_stackable',
        value: 1,
        name: '可堆叠',
        translations: {
          en: 'Stackable',
          ja: 'スタッキング可能',
        },
      },
    ]

    const promises = data.map((item) => {
      const dictionary = new Dictionary(item)
      return dictionary.save()
    })

    await Promise.all(promises)

    logger.info('Position stackable dictionaries inserted successfully.')
  } catch (error) {
    logger.error('Error inserting position stackable dictionaries.')
  }
}

// Inserting status dictionaries
async function insertStatus() {
  try {
    const data = [
      {
        key: 'status',
        value: 0,
        name: '无效',
        translations: {
          en: 'Invalid',
          ja: '無効',
        },
      },
      {
        key: 'status',
        value: 1,
        name: '有效',
        translations: {
          en: 'Valid',
          ja: '有効',
        },
      },
    ]

    const promises = data.map((item) => {
      const dictionary = new Dictionary(item)
      return dictionary.save()
    })

    await Promise.all(promises)

    logger.info('Status dictionaries inserted successfully.')
  } catch (error) {
    logger.error('Error inserting status dictionaries.')
  }
}

// Inserting sop dictionaries
async function insertSops() {
  try {
    const data = [
      {
        key: 'sops',
        value: 0,
        name: '角色管理',
        translations: {
          en: 'Roles Management',
          ja: 'ロール管理',
        },
      },
      {
        key: 'sops',
        value: 1,
        name: '用户管理',
        translations: {
          en: 'Users Management',
          ja: 'ユーザー管理',
        },
      },
      {
        key: 'sops',
        value: 2,
        name: '条码生成',
        translations: {
          en: 'Barcode Generate',
          ja: 'バーコード生成',
        },
      },
      {
        key: 'sops',
        value: 3,
        name: '条码管理',
        translations: {
          en: 'Barcode Management',
          ja: 'バーコード管理',
        },
      },
      {
        key: 'sops',
        value: 4,
        name: '库位码生成',
        translations: {
          en: 'Position Generate',
          ja: 'ポジションコード生成',
        },
      },
      {
        key: 'sops',
        value: 5,
        name: '库位码管理',
        translations: {
          en: 'Position Management',
          ja: 'ポジションコード管理',
        },
      },
    ]

    const promises = data.map((item) => {
      const dictionary = new Dictionary(item)
      return dictionary.save()
    })

    await Promise.all(promises)

    logger.info('Sops dictionaries inserted successfully.')
  } catch (error) {
    logger.error('Error inserting sops dictionaries.')
  }
}

// Inserting sensor types dictionaries
async function insertSensorTypes() {
  try {
    const data = [
      {
        key: 'sensor_type',
        value: 0,
        name: '温湿度传感器',
        translations: {
          en: 'Temperature & Humidity Sensor',
          ja: '温湿度センサー',
        },
      },
    ]

    const promises = data.map((item) => {
      const dictionary = new Dictionary(item)
      return dictionary.save()
    })

    await Promise.all(promises)

    logger.info('Status dictionaries inserted successfully.')
  } catch (error) {
    logger.error('Error inserting status dictionaries.')
  }
}

function insertDictionaries() {
  insertSops()
  insertStatus()
  insertBarcodeStatus()
  insertPositionStackable()
  insertSensorTypes()
}

module.exports = { insertDictionaries }
