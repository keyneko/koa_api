const Barcode = require('../models/barcode')
const { generateBarcode } = require('../controllers/barcodeController')

// Inserting barcodes
async function insertBarcodes() {
  try {
    const data = [
      { name: '圈圈教你玩转USB' },
      { name: 'Koa与Node.js开发实战' },
      { name: 'Node-RED视觉化开发工具' },
      { name: '前端自动化测试框架Cypress从入门到精通' },
      { name: '8051软核处理设计实战' },
    ]

    for (const item of data) {
      const value = await generateBarcode('SJ')
      const barcode = new Barcode({
        value,
        name: item.name,
        quantity: 1,
        basicUnit: '本',
        status: 1,
      })
      await barcode.save()
    }

    console.log('Barcodes inserted successfully.')
  } catch (error) {
    console.error('Error inserting barcodes.', error)
  }
}

module.exports = { insertBarcodes }
