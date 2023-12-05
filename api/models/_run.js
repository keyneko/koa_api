const Barcode = require('../models/barcode')
const BarcodeStatus = require('../models/barcodeStatus')

// // Inserting barcode status dictionary values
// const Other = new BarcodeStatus({ name: 'Other', value: 0 })
// const InStock = new BarcodeStatus({ name: 'In Stock', value: 1 })
// const InTransit = new BarcodeStatus({ name: 'In Transit', value: 2 })
// const Scrapped = new BarcodeStatus({ name: 'Scrapped', value: 3 })
// const Lost = new BarcodeStatus({ name: 'Lost', value: 4 })

// Other.save()
// InStock.save()
// InTransit.save()
// Scrapped.save()
// Lost.save()

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
