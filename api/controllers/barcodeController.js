const Barcode = require('../models/barcode')
const { logger } = require('../utils/logger')
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

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
    const decoded = ctx.state.decoded
    const createdBy = decoded.userId
    const isAdmin = (decoded.roles || []).some((role) => role.isAdmin)

    const filter = {}
    if (status !== undefined && status !== '') {
      filter.status = status
    }
    if (!isAdmin) {
      filter.createdBy = createdBy
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
          'isProtected',
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
      ...barcode.toObject(),
      name: barcode.translations?.name?.[language] || barcode.name,
      basicUnit:
        barcode.translations?.basicUnit?.[language] || barcode.basicUnit,
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
    logger.error(error.message)
  }
}

async function getBarcode(ctx) {
  try {
    const { value } = ctx.query
    const language = ctx.cookies.get('language')

    const barcode = await Barcode.findOne({ value }).select([
      'value',
      'name',
      'quantity',
      'basicUnit',
      'status',
      'isProtected',
      'files',
      'translations',
    ])

    if (!barcode) {
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
        ...barcode.toObject(),
        name: barcode.translations?.name?.[language] || barcode.name,
        basicUnit:
          barcode.translations?.basicUnit?.[language] || barcode.basicUnit,
      },
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
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
    const decoded = ctx.state.decoded

    const value = await generateBarcode(category)
    const newBarcode = new Barcode({
      name,
      basicUnit,
      value,
      quantity,
      status,
      files,
      createdBy: decoded.userId,
    })

    // Handle translations based on the language value
    if (language === 'zh' || language === undefined) {
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
    logger.error(error.message)
  }
}

async function updateBarcode(ctx) {
  try {
    const { value, isProtected } = ctx.request.body
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
    if (isProtected !== undefined) barcode.isProtected = isProtected

    await barcode.save()

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
  }
}

async function deleteBarcode(ctx) {
  try {
    const { value } = ctx.query
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

    // Check if it is protected
    if (barcode.isProtected) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'protectedBarcode',
      )
      return
    }

    await Barcode.findOneAndDelete({ value })

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    logger.error(error.message)
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
