const mongoose = require('mongoose');

// Subschemas
const taxSchema = new mongoose.Schema({
  name: { type: String, required: false },
  rate: { type: Number, required: false },
});

const specificationSchema = new mongoose.Schema({
  key: { type: String, required: false },
  value: { type: String, required: false },
}, { _id: false });

// Main schema
const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productCode: { type: String, required: true, unique: true },

  imageUrl: { type: String, required: false },
  imageFileId: { type: String, required: false },
  imageDeleteFlag: { type: Boolean, default: false },

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

// ✅ 1. On product creation
productSchema.pre('save', function (next) {
  if (this.isNew) {
    this.inStock = this.stock > 0;
  }
  next();
});

// ✅ 2. On update via findOneAndUpdate / updateOne / updateMany
function forceInStockFalseOnZero(next) {
  const update = this.getUpdate();

  // Normalize update object
  let stockVal;

  if (update.stock !== undefined) {
    stockVal = update.stock;
  } else if (update.$set && update.$set.stock !== undefined) {
    stockVal = update.$set.stock;
  }

  if (typeof stockVal === 'number' && stockVal < 1) {
    if (!update.$set) update.$set = {};
    update.$set.inStock = false;
  }

  next();
}

productSchema.pre('findOneAndUpdate', forceInStockFalseOnZero);
productSchema.pre('updateOne', forceInStockFalseOnZero);
productSchema.pre('updateMany', forceInStockFalseOnZero);

module.exports = mongoose.model('Product', productSchema);
