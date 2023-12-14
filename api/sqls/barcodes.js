const Barcode = require('../models/barcode')
const { generateBarcode } = require('../controllers/barcodeController')
const { logger } = require('../utils/logger')

// Inserting barcodes
async function insertBarcodes() {
  try {
    const data = [
      {
        category: 'SJ',
        name: '圈圈教你玩转USB',
        basicUnit: '本',
        translations: {
          name: {
            en: 'Circle teaches you how to play with USB',
            ja: 'サークルがUSBで遊ぶ方法を教えます',
          },
          basicUnit: {
            en: 'pcs',
            ja: '本',
          },
        },
      },
      {
        category: 'SJ',
        name: 'Koa与Node.js开发实战',
        basicUnit: '本',
        translations: {
          name: {
            en: 'Koa and Node.js development practice',
            ja: 'KoaとNode.jsの実践的な開発',
          },
          basicUnit: {
            en: 'pcs',
            ja: '本',
          },
        },
      },
      {
        category: 'SJ',
        name: 'Node-RED视觉化开发工具',
        basicUnit: '本',
        translations: {
          name: {
            en: 'Node-RED visual development tool',
            ja: 'Node-REDビジュアル開発ツール',
          },
          basicUnit: {
            en: 'pcs',
            ja: '本',
          },
        },
      },
      {
        category: 'SJ',
        name: '前端自动化测试框架Cypress从入门到精通',
        basicUnit: '本',
        translations: {
          name: {
            en: 'Front-end automated testing framework Cypress',
            ja: 'フロントエンド自動テスト フレームワーク Cypress',
          },
          basicUnit: {
            en: 'pcs',
            ja: '本',
          },
        },
      },
      {
        category: 'SJ',
        name: '8051软核处理设计实战',
        basicUnit: '本',
        translations: {
          name: {
            en: '8051 soft core processing design practice',
            ja: '8051 ソフトコア処理の設計実践',
          },
          basicUnit: {
            en: 'pcs',
            ja: '本',
          },
        },
      },
      {
        category: 'WJ',
        name: '超级飞侠乐迪手办',
        basicUnit: '只',
        translations: {
          name: {
            en: 'Super Wings Reddy figure',
            ja: 'スーパーウイングス レディ フィギュア',
          },
          basicUnit: {
            en: 'pcs',
            ja: '枚',
          },
        },
      },
    ]

    for (const item of data) {
      const value = await generateBarcode(item.category)
      const barcode = new Barcode({
        ...item,
        value,
      })
      await barcode.save()
    }

    logger.info('Barcodes inserted successfully.')
  } catch (error) {
    logger.error('Error inserting barcodes.')
  }
}

module.exports = { insertBarcodes }
