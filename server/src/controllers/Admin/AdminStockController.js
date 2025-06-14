const Product = require('../../models/ProductModel');
const Order = require('../../models/OrderModel');
const StockTransaction = require('../../models/StockTransactionModel')

const StockServices = require ('../../services/StockServices');



//////////////////// for Stock Table -> ////////////////////////////

exports.updateStock = async (req, res) => {
  try {
    const { productId, newStock, reason = 'Manual update' } = req.body;

    if (typeof newStock !== 'number' || !productId) {
      return res.status(400).json({ msg: 'productId and newStock (number) are required' });
    }

    // 1. Get old stock
    const oldStock = await StockServices.getStockValueByProductId(productId);
    if (oldStock === null) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // 2. Calculate quantity change
    const quantityChange = newStock - oldStock;


    // 3. Call the reusable stock update function
    const success = await StockServices.updateStock(productId, quantityChange, reason);

    if (!success) {
      return res.status(500).json({ msg: 'Failed to update stock' });
    }

    return res.status(200).json({
      msg: 'Stock updated successfully',
      productId,
      oldStock,
      newStock
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    return res.status(500).json({ msg: 'Internal server error' });
  }
};

exports.updateStockStatus = async (req, res) => {
  try {
    const { inStock, productId } = req.body;
    // Check productId presence and that inStock is not undefined (false is valid)
    if (typeof inStock !== 'boolean' || !productId) {
      return res.status(400).json({ msg: 'productId and inStock status are required' });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { inStock },
      { new: true } // returns the updated document
    );
    if (!updatedProduct) {
      return res.status(404).json({ msg: 'product not found' });
    }

    return res.status(200).json({ msg: 'Product inStock status updated successfully' });
  } catch (error) {
    console.error('Error updating product inStock status:', error);
    return res.status(500).json({ msg: 'Internal server error' });
  }
};

exports.getStockData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page * limit;
    const search = req.query.search || '';

    const allowedSortFields = ['productName', 'stock', 'inStock', 'pendingOrderCount', 'stockNeeds'];
    const sortBy = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'productName';
    const order = req.query.order === 'desc' ? -1 : 1;

    const baseProducts = await Product.find({
      isDeleted: false,
      productName: { $regex: search, $options: 'i' }
    }, '_id productName stock inStock').lean();

    const productIds = baseProducts.map(p => p._id);
    const aggregates = await Order.aggregate([
      { $match: { status: 'Pending', isDeleted: false } },
      { $unwind: '$productList' },
      { $match: { 'productList.productId': { $in: productIds } } },
      {
        $group: {
          _id: '$productList.productId',
          pendingOrderCount: { $sum: 1 },
          stockNeeds: { $sum: '$productList.quantity' }
        }
      }
    ]);

    const aggregateMap = {};
    aggregates.forEach(({ _id, pendingOrderCount, stockNeeds }) => {
      aggregateMap[_id.toString()] = { pendingOrderCount, stockNeeds };
    });

    const mergedProducts = baseProducts.map(product => {
      const stats = aggregateMap[product._id.toString()] || { pendingOrderCount: 0, stockNeeds: 0 };
      return {
        ...product,
        pendingOrderCount: stats.pendingOrderCount,
        stockNeeds: stats.stockNeeds,
      };
    });

    const sortedProducts = mergedProducts.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === 'string') {
        return order * aValue.localeCompare(bValue);
      } else {
        return order * (aValue - bValue);
      }
    });

    const paginatedProducts = sortedProducts.slice(skip, skip + limit);
    const totalCount = mergedProducts.length;

    res.status(200).json({
      products: paginatedProducts,
      totalCount
    });

  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


//////////////////// for StockTransaction Table -> ////////////////////////////



exports.getTodayStockTransaction = async (req, res) => {

     const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // === IN STOCK (positive quantityChange) ===
  const inStockRows = await StockTransaction.find({
    timestamp: { $gte: startOfDay },
    quantityChange: { $gt: 0 }
  })
    .populate({ path: 'orderId', select: 'orderNumber' })
    .populate({ path: 'productId', select: 'productName' });

  const inStock = inStockRows.map(tx => ({
    productName: tx.productId?.productName || 'Unknown Product',
    quantityChange: tx.quantityChange,
    reason: tx.reason,
    orderNumber: tx.orderId?.orderNumber || null,
    date: tx.timestamp.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }));

  // === OUT STOCK (negative quantityChange) ===
  const outStockRows = await StockTransaction.find({
    timestamp: { $gte: startOfDay },
    quantityChange: { $lt: 0 }
  })
    .populate({ path: 'orderId', select: 'orderNumber' })
    .populate({ path: 'productId', select: 'productName' });

  const outStock = outStockRows.map(tx => ({
    productName: tx.productId?.productName || 'Unknown Product',
    quantityChange: tx.quantityChange,
    reason: tx.reason,
    orderNumber: tx.orderId?.orderNumber || null,
    date: tx.timestamp.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }));
    const todayStockTransaction ={
      inStock,
      outStock
    }
    return  res.status(200).json(todayStockTransaction);
       
}

function parseDateDMY(dateStr) {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? null : date;
}

exports.searchStockTransactions = async (req, res) => { 
 try {
    const { q } = req.body;
    if (!q) {
      return res.status(400).json({ error: 'Missing search query' });
    }

  
    // Try to parse q as a dd/mm/yyyy date
    const dateFromQuery = parseDateDMY(q);
    const isValidDate = dateFromQuery !== null;

    // Find products matching productName (case insensitive regex)
    const products = await Product.find({
      productName: { $regex: q, $options: 'i' }
    }).select('_id');

    const productIds = products.map(p => p._id);

    // Build the base query with OR condition:
    // - productId in matched products
    // - or timestamp within date if q is valid date
    let baseQuery = {
      $or: [
        { productId: { $in: productIds } }
      ]
    };

    if (isValidDate) {
      const nextDay = new Date(dateFromQuery);
      nextDay.setDate(nextDay.getDate() + 1);

      baseQuery.$or.push({
        timestamp: {
          $gte: dateFromQuery,
          $lt: nextDay
        }
      });
    }

    // Fetch IN STOCK transactions (quantityChange > 0)
    const inStockRows = await StockTransaction.find({
      ...baseQuery,
      quantityChange: { $gt: 0 }
    })
      .populate({ path: 'orderId', select: 'orderNumber' })
      .populate({ path: 'productId', select: 'productName' });

    // Format inStock results
    const inStock = inStockRows.map(tx => ({
      productName: tx.productId?.productName || 'Unknown Product',
      quantityChange: tx.quantityChange,
      reason: tx.reason,
      orderNumber: tx.orderId?.orderNumber || null,
      date: tx.timestamp.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }));

    // Fetch OUT STOCK transactions (quantityChange < 0)
    const outStockRows = await StockTransaction.find({
      ...baseQuery,
      quantityChange: { $lt: 0 }
    })
      .populate({ path: 'orderId', select: 'orderNumber' })
      .populate({ path: 'productId', select: 'productName' });

    // Format outStock results
    const outStock = outStockRows.map(tx => ({
      productName: tx.productId?.productName || 'Unknown Product',
      quantityChange: tx.quantityChange,
      reason: tx.reason,
      orderNumber: tx.orderId?.orderNumber || null,
      date: tx.timestamp.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }));

    // Return the result
    return res.status(200).json({ inStock, outStock });

  } catch (error) {
    console.error('Search stock transactions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

}
/////////////////////////////////////////////////////////



exports.getInStockTransactions = async (req, res) => {
  try {
    const { date, query, page = 1, limit = 10 } = req.query;

    const matchQuery = {
      quantityChange: { $gt: 0 }
    };

    if (date) {
      // Parse date from yyyy-mm-dd format
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0); // UTC midnight start
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1); // next day UTC midnight

      matchQuery.timestamp = { $gte: start, $lt: end };
    }

    if (query) {
      // Find product IDs matching query on productName or productCode
      const products = await Product.find({
        $or: [
          { productName: { $regex: query, $options: 'i' } },
          { productCode: { $regex: query, $options: 'i' } }
        ]
      }).select('_id');

      const productIds = products.map(p => p._id);
      if (productIds.length > 0) {
        matchQuery.productId = { $in: productIds };
      } else {
        // No matching products: return empty result immediately
        return res.json({ data: [], totalCount: 0 });
      }
    }

    const totalCount = await StockTransaction.countDocuments(matchQuery);

    const inStockTransactions = await StockTransaction.find(matchQuery)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('productId', 'productName productCode')
      .populate('orderId', 'orderNumber')
      .sort({ timestamp: -1 }); // newest first

    const responseData = inStockTransactions.map(tx => ({
      _id: tx._id,
      productId: tx.productId?._id || null,
      productName: tx.productId?.productName || null,
      quantityChange: tx.quantityChange,
      reason: tx.reason,
      orderId: tx.orderId?._id || null,
      orderNumber: tx.orderId?.orderNumber || null,
      timestamp: tx.timestamp
    }));

    return res.json({ data: responseData, totalCount });
  } catch (error) {
    console.error('Error fetching in-stock transactions:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getOutStockTransactions = async (req, res) => {
  try {
    const { date, query, page = 1, limit = 10 } = req.query;

    const matchQuery = {
      quantityChange: { $lt: 0 }
    };

    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);

      matchQuery.timestamp = { $gte: start, $lt: end };
    }

    if (query) {
      const products = await Product.find({
        $or: [
          { productName: { $regex: query, $options: 'i' } },
          { productCode: { $regex: query, $options: 'i' } }
        ]
      }).select('_id');

      const productIds = products.map(p => p._id);
      if (productIds.length > 0) {
        matchQuery.productId = { $in: productIds };
      } else {
        return res.json({ data: [], totalCount: 0 });
      }
    }

    const totalCount = await StockTransaction.countDocuments(matchQuery);

    const outStockTransactions = await StockTransaction.find(matchQuery)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('productId', 'productName productCode')
      .populate('orderId', 'orderNumber')
      .sort({ timestamp: -1 });

    const responseData = outStockTransactions.map(tx => ({
      _id: tx._id,
      productId: tx.productId?._id || null,
      productName: tx.productId?.productName || null,
      quantityChange: tx.quantityChange,
      reason: tx.reason,
      orderId: tx.orderId?._id || null,
      orderNumber: tx.orderId?.orderNumber || null,
      timestamp: tx.timestamp
    }));

    return res.json({ data: responseData, totalCount });
  } catch (error) {
    console.error('Error fetching out-stock transactions:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}




