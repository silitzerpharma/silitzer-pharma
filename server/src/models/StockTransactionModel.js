// models/StockTransaction.js

const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantityChange: { type: Number, required: true }, // positive or negative
  reason: { type: String, required: true }, // e.g., "sale", "return", "purchase", "adjustment"
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },  // optional: which order caused this
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
