const mongoose = require('mongoose');

const ProductOfferSchema = new mongoose.Schema({
  description: { type: String, required: true },
  validTill: { type: Date },
  image: { type: String }, // ImageKit URL

  imageKitFileId: { type: String }, // <-- 🔥 Added field for deletion from ImageKit

  applyToAll: { type: Boolean, default: true },

  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

module.exports = mongoose.model('ProductOffer', ProductOfferSchema);
