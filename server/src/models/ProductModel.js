const mongoose = require('mongoose');

const taxSchema = new mongoose.Schema({
  name: { type: String, required: false },
  rate: { type: Number, required: false },
});

const specificationSchema = new mongoose.Schema({
  key: { type: String, required: false },
  value: { type: String, required: false },
}, { _id: false });

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productCode: { type: String, required: true, unique: true },

  imageUrl: { type: String, required: false },
  imageFileId: { type: String, required: false },         // ✅ Added for ImageKit deletion
  imageDeleteFlag: { type: Boolean, default: false },     // ✅ Optional: Track deletion flag from frontend

  productDescription: { type: String, required: false },
  other: { type: String, required: false },
  itemRate: { type: Number, required: false },
  batchNumber: { type: String, required: false },
  expiryDate: { type: Date, required: false },
  manufactureDate: { type: Date, required: false },
  hsnCode: { type: String, required: false },
  purchaseRate: { type: Number, required: false },
  inStock: { type: Boolean, default: true },
  stock: { type: Number, required: false, default: 0 },
  totalOrders: { type: Number, default: 0 },
  unitsPerBox: { type: Number, required: false },
  manufacturer: { type: String, required: false },
  countryOfOrigin: { type: String, required: false },

  advantages: [{ type: String }],
  features: [{ type: String }],
  uses: [{ type: String }],
  howToUse: [{ type: String }],
  specifications: [specificationSchema],
  taxes: [taxSchema],

  addedDate: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
