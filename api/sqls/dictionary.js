const Dictionary = require('../models/dictionary')
const { logger } = require('../utils/logger')

// Inserting barcode status dictionary
async function insertBarcodeStatus() {
  try {
    const data = [
      {
        key: 'barcode_status',
        value: 0,
        name: '默认',
        isProtected: true,
        translations: {
          en: 'Default',
          ja: 'デフォルト',
        },
      },
      {
        key: 'barcode_status',
        value: 1,
        name: '在库',
        isProtected: true,
        translations: {
          en: 'In stock',
          ja: '在庫あり',
        },
      },
      {
        key: 'barcode_status',
        value: 2,
        name: '在途',
        isProtected: true,
        translations: {
          en: 'In transit',
          ja: '途中で',
        },
      },
      {
        key: 'barcode_status',
        value: 3,
        name: '已报废',
        isProtected: true,
        translations: {
          en: 'Scrapped',
          ja: '廃棄された',
        },
      },
      {
        key: 'barcode_status',
        value: 4,
        name: '已报失',
        isProtected: true,
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

    logger.info('Barcode status dictionary inserted successfully.')
  } catch (error) {
    logger.error('Error inserting barcode status dictionary.')
  }
}

// Inserting position stackable dictionary
async function insertPositionStackable() {
  try {
    const data = [
      {
        key: 'position_stackable',
        value: 0,
        name: '不可堆叠',
        isProtected: true,
        translations: {
          en: 'Not stackable',
          ja: 'スタッキング不可',
        },
      },
      {
        key: 'position_stackable',
        value: 1,
        name: '可堆叠',
        isProtected: true,
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

    logger.info('Position stackable dictionary inserted successfully.')
  } catch (error) {
    logger.error('Error inserting position stackable dictionary.')
  }
}

// Inserting status dictionary
async function insertStatus() {
  try {
    const data = [
      {
        key: 'status',
        value: 0,
        name: '无效',
        isProtected: true,
        translations: {
          en: 'Invalid',
          ja: '無効',
        },
      },
      {
        key: 'status',
        value: 1,
        name: '有效',
        isProtected: true,
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

    logger.info('Status dictionary inserted successfully.')
  } catch (error) {
    logger.error('Error inserting status dictionary.')
  }
}

// Inserting sop dictionary
async function insertSops() {
  try {
    const data = [
      {
        key: 'sops',
        value: 0,
        name: '角色管理',
        isProtected: true,
        translations: {
          en: 'Roles Management',
          ja: 'ロール管理',
        },
      },
      {
        key: 'sops',
        value: 1,
        name: '用户管理',
        isProtected: true,
        translations: {
          en: 'Users Management',
          ja: 'ユーザー管理',
        },
      },
      {
        key: 'sops',
        value: 2,
        name: '条码生成',
        isProtected: true,
        translations: {
          en: 'Barcode Create',
          ja: 'バーコード生成',
        },
      },
      {
        key: 'sops',
        value: 3,
        name: '条码管理',
        isProtected: true,
        translations: {
          en: 'Barcode Management',
          ja: 'バーコード管理',
        },
      },
      {
        key: 'sops',
        value: 4,
        name: '库位码生成',
        isProtected: true,
        translations: {
          en: 'Position Create',
          ja: 'ポジションコード生成',
        },
      },
      {
        key: 'sops',
        value: 5,
        name: '库位码管理',
        isProtected: true,
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

    logger.info('Sops dictionary inserted successfully.')
  } catch (error) {
    logger.error('Error inserting sops dictionary.')
  }
}

// Inserting sensor types dictionary
async function insertSensorTypes() {
  try {
    const data = [
      {
        key: 'sensor_type',
        value: 0,
        name: '温湿度传感器',
        isProtected: true,
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

    logger.info('Sensor types dictionary inserted successfully.')
  } catch (error) {
    logger.error('Error inserting sensor types dictionary.')
  }
}

// Inserting other miscellaneous dictionary
async function insertMiscellaneous() {
  try {
    const data = [
      {
        key: 'online',
        value: 0,
        name: '离线',
        isProtected: true,
        translations: {
          en: 'Offline',
          ja: 'オフライン',
        },
      },
      {
        key: 'online',
        value: 1,
        name: '在线',
        isProtected: true,
        translations: {
          en: 'Online',
          ja: 'オンライン',
        },
      },
      {
        key: 'yes_or_no',
        value: 0,
        name: '否',
        isProtected: true,
        translations: {
          en: 'No',
          ja: 'いいえ',
        },
      },
      {
        key: 'yes_or_no',
        value: 1,
        name: '是',
        isProtected: true,
        translations: {
          en: 'Yes',
          ja: 'はい',
        },
      },
    ]

    const promises = data.map((item) => {
      const dictionary = new Dictionary(item)
      return dictionary.save()
    })

    await Promise.all(promises)

    logger.info('Sensor types dictionary inserted successfully.')
  } catch (error) {
    logger.error('Error inserting sensor types dictionary.')
  }
}

function insertDictionaries() {
  // insertSops()
  insertStatus()
  insertBarcodeStatus()
  insertPositionStackable()
  insertSensorTypes()
  insertMiscellaneous()
}

module.exports = { insertDictionaries }
