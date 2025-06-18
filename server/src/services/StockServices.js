const mongoose = require('mongoose');
const Product = require('../models/ProductModel');
const StockTransaction = require('../models/StockTransactionModel');

exports.updateStock = async (productId, quantityChange, reason, orderId = null) => {
  try {
    // 1. Fetch product
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    // 2. Calculate new stock
    let newStock = product.stock + quantityChange;

    // If new stock is negative and change is negative, set stock to 0
    if (newStock < 0 && quantityChange < 0) {
      newStock = 0;
    }

    product.stock = newStock;

    // ✅ 3. Set inStock = false if stock is less than 1
    if (newStock < 1) {
      product.inStock = false;
    }

    // ✅ 4. If orderId is provided, increment totalOrders
    if (orderId) {
      product.totalOrders = (product.totalOrders || 0) + 1;
    }

    await product.save();

    // 5. Log the stock change
    const transaction = new StockTransaction({
      productId,
      quantityChange,
      reason,
      ...(orderId && { orderId }) // Add orderId only if provided
    });

    await transaction.save();

    return true;
  } catch (error) {
    console.error('Error updating stock:', error.message);
    return false;
  }
};





exports.getStockValueByProductId = async (productId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid product ID');
    }

    const product = await Product.findById(productId).select('stock');
    if (!product) {
      return null; // Or throw an error if preferred
    }

    return product.stock;
  } catch (error) {
    console.error('Error fetching stock value:', error.message);
    throw error;
  }
}


exports.getTodayStockTotals = async()=> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Aggregate inStock (quantityChange > 0)
  const inStockAgg = await StockTransaction.aggregate([
    {
      $match: {
        timestamp: { $gte: startOfDay },
        quantityChange: { $gt: 0 }
      }
    },
    {
      $group: {
        _id: null,
        totalIn: { $sum: '$quantityChange' }
      }
    }
  ]);

  // Aggregate outStock (quantityChange < 0)
  const outStockAgg = await StockTransaction.aggregate([
    {
      $match: {
        timestamp: { $gte: startOfDay },
        quantityChange: { $lt: 0 }
      }
    },
    {
      $group: {
        _id: null,
        totalOut: { $sum: '$quantityChange' }
      }
    }
  ]);

  const inStock = inStockAgg[0]?.totalIn || 0;
  const outStock = Math.abs(outStockAgg[0]?.totalOut || 0); // make it positive

  return { inStock, outStock };
}