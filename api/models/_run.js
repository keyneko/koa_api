const Barcode = require('../models/barcode')
const Dictionary = require('../models/dictionary')

// // 生成条码
// async function generateBarcode(categoryCode) {
//   const category = categoryCode.toUpperCase()

//   // Validate the category code
//   if (!/^[A-Z]{2}$/.test(category)) {
//     throw new Error('Invalid category code')
//   }

//   // Get the current date in YYYYMMDD format
//   const currentDate = new Date()
//   const dateCode = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1)
//     .toString()
//     .padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`

//   console.log('Generated Category:', category);
//   console.log('Generated Date Code:', dateCode);

//   // Use the aggregation pipeline to find the last generated barcode for the specified category and date code
//   const lastBarcode = await Barcode.aggregate([
//     {
//       $match: {
//         value: {
//           $regex: `^${category}${dateCode}`, // Match the start of the value field
//         },
//       },
//     },
//     {
//       $sort: {
//         value: -1, // Sort in descending order based on value
//       },
//     },
//     {
//       $limit: 1,
//     },
//   ]);

//   console.log('Aggregation Result:', lastBarcode);

//   // Calculate the next incremental number
//   const nextIncrementalNumber = (lastBarcode.length > 0 ? parseInt(lastBarcode[0].value.slice(-4), 10) : 0) + 1;

//   // Combine components to form the complete barcode value
//   const barcodeValue = `${category}${dateCode}${nextIncrementalNumber.toString().padStart(4, '0')}`

//   return barcodeValue
// }

// // Example usage
// generateBarcode('SJ').then(async (res) => {
//   console.log('Barcode 1:', res)

//   // try {
//   //   const newBarcode = new Barcode({
//   //     value: res,
//   //     name: '圈圈教你玩转USB',
//   //     quantity: 1,
//   //     basicUnit: '本',
//   //     status: 1,
//   //   })

//   //   const savedBarcode = await newBarcode.save()
//   //   console.log('Barcode inserted successfully:', savedBarcode)
//   // } catch (error) {
//   //   console.error('Error creating and inserting barcode:', error.message)
//   // }
// })

// // Inserting barcode status dictionary values
// const Default = new Dictionary({
//   key: 'barcode_status',
//   value: 0,
//   name: '默认',
// })
// const InStock = new Dictionary({
//   key: 'barcode_status',
//   value: 1,
//   name: '在库',
// })
// const InTransit = new Dictionary({
//   key: 'barcode_status',
//   value: 2,
//   name: '在途',
// })
// const Scrapped = new Dictionary({
//   key: 'barcode_status',
//   value: 3,
//   name: '已报废',
// })
// const Lost = new Dictionary({
//   key: 'barcode_status',
//   value: 4,
//   name: '已报失',
// })

// Default.save()
// InStock.save()
// InTransit.save()
// Scrapped.save()
// Lost.save()
