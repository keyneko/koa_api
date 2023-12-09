const Barcode = require('../models/barcode')
const {
  getErrorMessage,
  statusCodes,
  statusMessages,
} = require('../statusCodes')

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
        .select(['value', 'name', 'quantity', 'basicUnit', 'status', 'files'])
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit),
      Barcode.countDocuments(filter),
    ])

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: barcodes,
      total,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function getBarcode(ctx) {
  try {
    const language = ctx.cookies.get('language')
    const result = await Barcode.findOne({ value: ctx.query.value }).select([
      'value',
      'name',
      'quantity',
      'basicUnit',
      'status',
      'files',
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
      data: result,
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
      name,
      quantity,
      basicUnit,
      status,
      files,
    })

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
    const language = ctx.cookies.get('language')

    const result = await Barcode.findOneAndUpdate({ value }, ctx.request.body, {
      new: true,
    })

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
