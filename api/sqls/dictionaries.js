const Dictionary = require('../models/dictionary')

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
    ];

    const promises = data.map((item) => {
      const dictionary = new Dictionary(item)
      return dictionary.save()
    })

    await Promise.all(promises)

    console.log('Barcode status dictionaries inserted successfully.')
  } catch (error) {
    console.error('Error inserting barcode status dictionaries.')
  }
}

// Inserting position status dictionaries
async function insertPositionStatus() {
  try {
    const data = [
      {
        key: 'position_status',
        value: 0,
        name: '默认',
        translations: {
          en: 'Default',
          ja: 'デフォルト',
        },
      },
      {
        key: 'position_status',
        value: 1,
        name: '有效',
        translations: {
          en: 'Valid',
          ja: '有効',
        },
      },
      {
        key: 'position_status',
        value: 2,
        name: '失效',
        translations: {
          en: 'Invalid',
          ja: '無効',
        },
      },
    ]

    const promises = data.map((item) => {
      const dictionary = new Dictionary(item)
      return dictionary.save()
    })

    await Promise.all(promises)

    console.log('Position status dictionaries inserted successfully.')
  } catch (error) {
    console.error('Error inserting position status dictionaries.')
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

    console.log('Position stackable dictionaries inserted successfully.')
  } catch (error) {
    console.error('Error inserting position stackable dictionaries.')
  }
}

function insertDictionaries() {
  insertBarcodeStatus()
  insertPositionStatus()
  insertPositionStackable()
}

module.exports = { insertDictionaries }
