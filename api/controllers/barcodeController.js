const Barcode = require('../models/barcode')
const { logger } = require('../utils/logger')
const {
  getErrorMessage,
  statusCodes,
  statusMessages,
} = require('../utils/statusCodes')

// Generate barcode
async function generateBarcode(categoryCode) {
  const category = categoryCode.toUpperCase()

  // Validate the category code
  if (!/^[A-Z]{2}$/.test(category)) {
    throw new Error('Invalid category code')
  }

  // Get the current date in YYYYMMDD format
  const currentDate = new Date()
  const dateCode = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`

  // console.log('Generated Category:', category)
  // console.log('Generated Date Code:', dateCode)

  // Use the aggregation pipeline to find the last generated barcode for the specified category and date code
  const lastBarcode = await Barcode.aggregate([
    {
      $match: {
        value: {
          $regex: `^${category}${dateCode}`, // Match the start of the value field
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

  // console.log('Aggregation Result:', lastBarcode)

  // Calculate the next incremental number
  const nextIncrementalNumber =
    (lastBarcode.length > 0
      ? parseInt(lastBarcode[0].value.slice(-4), 10)
      : 0) + 1

  // Combine components to form the complete barcode value
  const barcodeValue = `${category}${dateCode}${nextIncrementalNumber
    .toString()
    .padStart(4, '0')}`

  return barcodeValue
}

async function getBarcodes(ctx) {
  try {
    const { pageNum = 1, pageSize = 10, status } = ctx.query
    const language = ctx.cookies.get('language')

    const filter = {}
    if (status !== undefined && status !== '') {
      filter.status = status
    }

    const skip = (pageNum - 1) * pageSize
    const limit = parseInt(pageSize)

    const [barcodes, total] = await Promise.all([
      Barcode.find(filter)
        .select([
          'value',
          'name',
          'quantity',
          'basicUnit',
          'status',
          'files',
          'translations',
        ])
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit),
      Barcode.countDocuments(filter),
    ])

    // Map over the barcodes to retrieve translated values
    const mappedBarcodes = barcodes.map((barcode) => ({
      _id: barcode._id,
      value: barcode.value,
      name: barcode.translations?.name?.[language] || barcode.name,
      quantity: barcode.quantity,
      basicUnit:
        barcode.translations?.basicUnit?.[language] || barcode.basicUnit,
      status: barcode.status,
      files: barcode.files,
    }))

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: mappedBarcodes,
      total,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function getBarcode(ctx) {
  try {
    const { value } = ctx.query
    const language = ctx.cookies.get('language')

    const result = await Barcode.findOne({ value }).select([
      'value',
      'name',
      'quantity',
      'basicUnit',
      'status',
      'files',
      'translations',
    ])

    if (!result) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'barcodeNotFound',
      )
      return
    }

    ctx.body = {
      code: 200,
      data: {
        _id: result._id,
        value: result.value,
        name: result.translations?.name?.[language] || result.name,
        quantity: result.quantity,
        basicUnit:
          result.translations?.basicUnit?.[language] || result.basicUnit,
        status: result.status,
        files: result.files,
      },
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function createBarcode(ctx) {
  try {
    const {
      category,
      name,
      quantity = 1,
      basicUnit,
      status,
      files,
    } = ctx.request.body
    const language = ctx.cookies.get('language')

    const value = await generateBarcode(category)
    const newBarcode = new Barcode({
      value,
      quantity,
      status,
      files,
    })

    // Handle translations based on the language value
    if (language === 'zh' || language === undefined) {
      newBarcode.name = name
      newBarcode.basicUnit = basicUnit
    } else {
      // Use $set to add translations
      newBarcode.$set('translations', {
        name: {
          [language]: name,
        },
        basicUnit: {
          [language]: basicUnit,
        },
      })
    }

    await newBarcode.save()

    ctx.body = {
      code: 200,
      data: value,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function updateBarcode(ctx) {
  try {
    const { value } = ctx.request.body
    const updateData = { ...ctx.request.body }
    const language = ctx.cookies.get('language')

    const barcode = await Barcode.findOne({ value })

    if (!barcode) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'barcodeNotFound',
      )
      return
    }

    // Update default fields for 'zh' or undefined language
    if (language === 'zh' || language === undefined) {
      barcode.name = updateData.name || barcode.name
      barcode.basicUnit = updateData.basicUnit || barcode.basicUnit
    } else {
      // Update translations based on the specified language
      if ('name' in updateData) {
        barcode.translations.name = {
          ...(barcode.translations.name || {}),
          [language]: updateData.name,
        }
      }

      if ('basicUnit' in updateData) {
        barcode.translations.basicUnit = {
          ...(barcode.translations.basicUnit || {}),
          [language]: updateData.basicUnit,
        }
      }

      // Mark the modified fields to ensure they are saved
      barcode.markModified('translations')
    }

    barcode.quantity = updateData.quantity || barcode.quantity
    barcode.status = updateData.status || barcode.status
    barcode.files = updateData.files || barcode.files

    await barcode.save()

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function deleteBarcode(ctx) {
  try {
    const { value } = ctx.query
    const language = ctx.cookies.get('language')

    const result = await Barcode.findOneAndDelete({ value })
    if (!result) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'barcodeNotFound',
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
  generateBarcode,
  getBarcodes,
  getBarcode,
  createBarcode,
  updateBarcode,
  deleteBarcode,
}
