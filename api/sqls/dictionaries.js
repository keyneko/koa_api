const Dictionary = require('../models/dictionary')

// Inserting barcode status dictionaries
async function insertBarcodeStatus() {
  try {
    const data = [
      { key: 'barcode_status', value: 0, name: '默认' },
      { key: 'barcode_status', value: 1, name: '在库' },
      { key: 'barcode_status', value: 2, name: '在途' },
      { key: 'barcode_status', value: 3, name: '已报废' },
      { key: 'barcode_status', value: 4, name: '已报失' },
    ]

    const promises = data.map(async (item) => {
      const dictionary = new Dictionary(item)
      await dictionary.save()
    })

    await Promise.all(promises)

    console.log('Barcode status dictionaries inserted successfully.')
  } catch (error) {
    console.error('Error inserting barcode status dictionaries.')
  }
}

module.exports = { insertBarcodeStatus }
