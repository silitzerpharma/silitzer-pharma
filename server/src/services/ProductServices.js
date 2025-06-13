const mongoose = require('mongoose');
const Product = require('../models/ProductModel');
const Order = require('../models/OrderModel');
const ProductOffer = require('../models/ProductOfferModel');

exports.getNextProductCode = async () => {
  try {
    const lastProduct = await Product.findOne()
      .sort({ createdAt: -1 })
      .select('productCode');

    let lastNumber = 99; // Start from PRO-100

    if (lastProduct && lastProduct.productCode) {
      const match = lastProduct.productCode.match(/^PRO-(\d+)$/);
      if (match && match[1]) {
        lastNumber = parseInt(match[1], 10);
      }
    }

    const nextNumber = lastNumber + 1;
    return `PRO-${nextNumber}`;
  } catch (error) {
    console.error('Error generating next product code:', error);
    throw error;
  }
};

exports.countPendingOrdersByProduct= async (productId)=> {
  try {
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const count = await Order.countDocuments({
      status: 'Pending',
      isDeleted: false,
      productList: {
        $elemMatch: { productId: productObjectId }
      }
    });

    return count;
  } catch (error) {
    console.error('Error counting pending orders:', error);
    throw error;
  }
}


exports.getProductOffers = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Invalid product ID');
  }

  // Find offers that apply either to all products or specifically to this product
  const offers = await ProductOffer.find({
    $or: [
      { applyToAll: true },
      { products: productId }
    ]
  })
  .sort({ validTill: 1 }); // optional: sort by expiry date ascending

  // returns an array of offer objects
  return offers;
};




