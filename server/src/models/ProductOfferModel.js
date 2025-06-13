const mongoose = require('mongoose');

const ProductOfferSchema = new mongoose.Schema({
  description: { type: String, required: true },
  validTill: { type: Date },
  image: { type: String }, // URL or file path

  applyToAll: { type: Boolean, default: true }, // <-- Add this field

  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] // <-- New field
}, { timestamps: true });

module.exports = mongoose.model('ProductOffer', ProductOfferSchema);
