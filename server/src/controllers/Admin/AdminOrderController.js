const AuthUser = require('../../models/AuthUserModel');
const Order = require('../../models/OrderModel');
const Product = require('../../models/ProductModel');
const StockServices = require ('../../services/StockServices')
const XLSX = require('xlsx');
const OrderServices = require('../../services/OrderServices')
const { startOfToday, endOfToday } = require('date-fns');



exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const view = req.query.view || "All";
    const search = req.query.search?.trim() || "";
    const filterDate = req.query.filterDate;
    const showPending = req.query.showPending;

    const query = {};

    // View filter (order status)
    if (view !== "All") {
      query.status = view;
    }

    // Remove pending if showPending is false and no specific view
    if (showPending === "false" && view === "All") {
      query.status = { $ne: "Pending" };
    }

    // Date filter
    if (filterDate) {
      const dateObj = new Date(filterDate);
      if (!isNaN(dateObj)) {
        const nextDay = new Date(dateObj);
        nextDay.setDate(nextDay.getDate() + 1);
        query.orderDate = {
          $gte: dateObj,
          $lt: nextDay,
        };
      }
    }

    // Search logic
    if (search) {
      const searchRegex = new RegExp(search, "i");

      const dateParts = search.split("/");
      let dateMatchQuery = null;
      if (dateParts.length === 3) {
        let [day, month, year] = dateParts.map((part) => parseInt(part, 10));
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const formattedDate = new Date(year, month - 1, day);
          if (
            formattedDate.getFullYear() === year &&
            formattedDate.getMonth() === month - 1 &&
            formattedDate.getDate() === day
          ) {
            const nextDay = new Date(formattedDate);
            nextDay.setDate(formattedDate.getDate() + 1);
            dateMatchQuery = {
              orderDate: {
                $gte: formattedDate,
                $lt: nextDay,
              },
            };
          }
        }
      }

      const matchingDistributors = await AuthUser.find(
        { username: { $regex: searchRegex }, role: "distributor" },
        "_id"
      );
      const distributorIds = matchingDistributors.map((d) => d._id);

      const matchingProducts = await Product.find(
        {
          $or: [
            { productName: { $regex: searchRegex } },
            { productCode: { $regex: searchRegex } },
          ],
        },
        "_id"
      );
      const productIds = matchingProducts.map((p) => p._id);

      query.$or = [
        { orderNumber: { $regex: searchRegex } },
        { distributor: { $in: distributorIds } },
        { "productList.productId": { $in: productIds } },
        ...(dateMatchQuery ? [dateMatchQuery] : []),
      ];
    }

    const totalCount = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .populate("distributor", "username")
      .populate("productList.productId", "productName productCode");

    const transformedOrders = orders.map((order) => ({
      id: order._id,
      distributorId: order.distributor?._id || null,
      order_id: order.orderNumber,
      Distributor: order.distributor?.username || "Unknown",
      order_date: order.orderDate,
      order_status: order.status,
      payment_status: order.paymentStatus,
      products_list: Array.isArray(order.productList)
        ? order.productList.map((product) => ({
            productId: product.productId?._id || null,
            product_name: product.productId?.productName || "Unknown",
            product_code: product.productId?.productCode || "Unknown",
            quantity: product.quantity,
          }))
        : [],
    }));

    res.status(200).json({
      orders: transformedOrders,
      totalCount,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};
exports.getAllPendingOrders = async (req, res) => {
  try {
    const {
      page = 0,
      limit = 10,
      startDate,
      searchQuery,
    } = req.query;

    const skip = parseInt(page) * parseInt(limit);
    const status = 'Pending';

    const matchConditions = {
      status,
      isDeleted: false, // Optional: skip deleted orders
    };

    // Filter by date if provided
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(startDate);
      end.setHours(23, 59, 59, 999);
      matchConditions.orderDate = { $gte: start, $lte: end };
    }

    const pipeline = [
      { $match: matchConditions },

      // Lookup distributor info (from AuthUser)
      {
        $lookup: {
          from: 'authusers', // MongoDB collection name (should be lowercase plural)
          localField: 'distributor',
          foreignField: '_id',
          as: 'distributor'
        }
      },
      { $unwind: '$distributor' },
    ];

    // Add search filtering
    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'distributor.username': { $regex: regex } },
            { orderNumber: { $regex: regex } }
          ]
        }
      });
    }

    // Count total first
    const countPipeline = [...pipeline, { $count: 'total' }];

    // Pagination and sorting
    pipeline.push(
      { $sort: { orderDate: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    // Run queries
    const [orders, countResult] = await Promise.all([
      Order.aggregate(pipeline),
      Order.aggregate(countPipeline)
    ]);

    const totalCount = countResult[0]?.total || 0;

    // Transform result
    const transformedOrders = orders.map(order => ({
      id: order._id,
      order_id: order.orderNumber,
      distributorId: order.distributor?._id,
      Distributor: order.distributor?.username || 'N/A',
      order_date: order.orderDate
    }));

    return res.status(200).json({
      orders: transformedOrders,
      totalCount,
    });

  } catch (error) {
    console.error('Error fetching pending orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pending orders',
      error: error.message,
    });
  }
};
exports.getOrder = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    // ✅ Populate product details inside productList
    const order = await Order.findById(id).populate('productList.productId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const distributor = await AuthUser.findById(order.distributor);
    if (!distributor) {
      return res.status(404).json({ error: 'Distributor not found' });
    }
    const orderData = {
      id: order._id,
      orderNumber: order.orderNumber,
      distributorId: order.distributor,
      distributorName: distributor.username,
      orderDate: order.orderDate,
      orderInstructions:order.orderInstructions,
      products_list: order.productList.map(product => ({
        productId: product.productId._id,
        productName: product.productId.productName,
        quantity: product.quantity,
        itemRate: product.productId.itemRate,
        purchaseRate: product.productId.purchaseRate,
        stock: product.productId.stock || 0,
        taxes: product.productId.taxes
      }))
    };

    res.status(200).json(orderData);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.approveOrder = async (req, res) => {
  try {
    const {orderId, productList, subtotal,totalPurchaseCost,netAmount,receivedAmount, ...rest} = req.body;
    if (!orderId) {
      return res.status(400).json({ msg: 'orderId is required' });
    }
    let paymentStatus = 'Pending';
    if (netAmount !== 0 && receivedAmount >= netAmount) {
      paymentStatus = 'Completed';
    }
    // Step 1: Find the order first to update statusHistory
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    // Step 2: Push new status history
    order.statusHistory.push({
      status: 'Approved',
      changedAt: new Date(),
      changedBy: req.user?.id || undefined  // Optional tracking of admin/user
    });

    // Step 3: Update stock for each product
    for (const product of productList) {
      const { productId, quantity } = product;
      const reason = 'Order approved - stock deducted';
      const success = await StockServices.updateStock(productId, -quantity, reason, orderId);
      if (!success) {
        console.warn(`Stock not updated for productId ${productId}`);
      }
    }
   
      // Step 4: Apply all updates
    order.set({
      productList,
      subtotal,
      totalPurchaseCost,
      netAmount,
      receivedAmount,
      status: 'Approved',
      paymentStatus,
      ...rest
    });

    // Step 5: Save the order with all updates
    const updatedOrder = await order.save();


    OrderServices.updateOrderSocket(req); 
 

    res.json({ msg: 'Order Approved, status updated, and stock updated', updatedOrder });
  } catch (error) {
    console.error('Approve order error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ msg: 'orderId and status are required' });
    }

    // Normalize status to Title Case (e.g., 'approved' -> 'Approved')
    const titleCaseStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    // Allowed statuses consistent with schema enum
    const allowedStatuses = ['Pending', 'Approved', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Hold'];

    if (!allowedStatuses.includes(titleCaseStatus)) {
      return res.status(400).json({ msg: `Invalid status: ${status}` });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Update status and push to history
    order.status = titleCaseStatus;
    order.statusHistory.push({
      status: titleCaseStatus,
      changedAt: new Date(),
      // optionally add changedBy if you have user info: changedBy: req.user._id
    });

    await order.save();


   OrderServices.updateOrderSocket(req); 

    return res.json({
      msg: 'Order status updated successfully',
      updatedOrder: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ msg: 'Internal server error' });
  }
};
exports.updateOrderPaymentStatus = async (req, res) => {
  try {
    const { orderId, paymentStatus } = req.body;

    if (!orderId || !paymentStatus) {
      return res.status(400).json({ msg: 'orderId and status are required' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true } // returns the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ msg: 'Order not found' });
    }

     OrderServices.updateOrderSocket(req); 
 
    return res.status(200).json({
      msg: 'Order status updated successfully',
      updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ msg: 'Internal server error' });
  }
}
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId, updateStock } = req.body;

    if (!orderId) {
      return res.status(400).json({ msg: 'orderId is required' });
    }

    const status = 'Cancelled';

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    if (updateStock) {
      // For each product in the order, increase stock by quantity
      for (const product of updatedOrder.productList) {
        const { productId, quantity } = product;

        // Get old stock (optional, but you may want to log or check)
        const oldStock = await StockServices.getStockValueByProductId(productId);
        if (oldStock === null) {
          console.warn(`Product not found for stock update: ${productId}`);
          continue; // skip this product
        }

        // Quantity change is positive since stock is increased on cancel
        const quantityChange = quantity;

        const reason = 'Order canceled - stock restored';

        // Update stock via your service; no orderId needed here
        const success = await StockServices.updateStock(productId, quantityChange, reason);
        if (!success) {
          console.warn(`Failed to update stock for productId ${productId}`);
          // Optionally handle failure (rollback or notify)
        }
      }
    }
           OrderServices.updateOrderSocket(req);  
  
    return res.status(200).json({ msg: 'Order status updated successfully', updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ msg: 'Internal server error' });
  }

};
exports.allOrderRecords = async (req, res) => {
  try {
    const {
      startdate,
      enddate,
      status: statusSearch,
      distributor: distributorsSearch,
      product: productsSearch,
      page = 1,
      limit = 10
    } = req.query;

    const query = { isDeleted: false };

    // Time-based filters with UTC awareness
    if (startdate && enddate) {
      const startUTC = new Date(`${startdate}T00:00:00.000Z`);
      const endUTC = new Date(`${enddate}T23:59:59.999Z`);
      query.orderDate = { $gte: startUTC, $lte: endUTC };
    } else if (startdate) {
      const startUTC = new Date(`${startdate}T00:00:00.000Z`);
      const endUTC = new Date(`${startdate}T23:59:59.999Z`);
      query.orderDate = { $gte: startUTC, $lte: endUTC };
    }

    // Status filter
    if (statusSearch && statusSearch !== 'All') {
      query.status = statusSearch;
    }

    // Distributor filter
    if (distributorsSearch) {
      const matchedDistributor = await AuthUser.findOne({
        username: distributorsSearch,
        role: 'distributor',
        isDeleted: false,
      }).select('_id');

      if (!matchedDistributor) {
        return res.json({
          success: true,
          data: [],
          currentPage: Number(page),
          totalPages: 0
        });
      }

      query.distributor = matchedDistributor._id;
    }

    // Step 1: Fetch full list (only product filter needs full scan)
    let fullOrders = await Order.find(query)
      .populate({
        path: 'distributor',
        select: 'username'
      })
      .populate({
        path: 'productList.productId',
        model: 'Product',
        select: 'productName productCode'
      })
      .sort({ orderDate: -1 });

    // Step 2: Filter by product if needed
    if (productsSearch) {
      const search = productsSearch.toLowerCase();
      fullOrders = fullOrders.filter(order =>
        order.productList.some(item => {
          const product = item.productId;
          return product &&
            (product.productName?.toLowerCase().includes(search) ||
             product.productCode?.toLowerCase().includes(search));
        })
      );
    }

    // Step 3: Pagination
    const totalRecords = fullOrders.length;
    const totalPages = Math.ceil(totalRecords / limit);
    const currentPage = Math.max(Number(page), 1);
    const paginatedOrders = fullOrders.slice((currentPage - 1) * limit, currentPage * limit);

    res.json({
      success: true,
      data: paginatedOrders,
      currentPage,
      totalPages
    });

  } catch (error) {
    console.error("Error fetching all order records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};
exports.downloadOrderRecords = async (req, res) => {
  try {
    const {
      startdate,
      enddate,
      status: statusSearch,
      distributor: distributorsSearch,
      product: productsSearch,
    } = req.query;

    const query = { isDeleted: false };

    if (startdate && enddate) {
      const startUTC = new Date(`${startdate}T00:00:00.000Z`);
      const endUTC = new Date(`${enddate}T23:59:59.999Z`);
      query.orderDate = { $gte: startUTC, $lte: endUTC };
    } else if (startdate) {
      const startUTC = new Date(`${startdate}T00:00:00.000Z`);
      const endUTC = new Date(`${startdate}T23:59:59.999Z`);
      query.orderDate = { $gte: startUTC, $lte: endUTC };
    }

    if (statusSearch && statusSearch !== 'All') {
      query.status = statusSearch;
    }

    if (distributorsSearch) {
      const distributor = await AuthUser.findOne({
        username: distributorsSearch,
        role: 'distributor',
        isDeleted: false
      });
      if (!distributor) {
        return res.status(200).send(Buffer.alloc(0)); // empty file
      }
      query.distributor = distributor._id;
    }

    let orders = await Order.find(query)
      .populate('distributor', 'username')
      .populate('productList.productId', 'productName productCode')
      .sort({ orderDate: -1 });

    // Filter by product if needed
    if (productsSearch) {
      const search = productsSearch.toLowerCase();
      orders = orders.filter(order =>
        order.productList.some(item => {
          const product = item.productId;
          return product &&
            (product.productName?.toLowerCase().includes(search) ||
             product.productCode?.toLowerCase().includes(search));
        })
      );
    }

    const data = orders.map(order => ({
      OrderNumber: order.orderNumber,
      Distributor: order.distributor?.username || '',
      OrderDate: new Date(order.orderDate).toISOString().split('T')[0],
      Status: order.status,
      PaymentStatus: order.paymentStatus,
      Products: order.productList.map(p =>
        `${p.productId?.productName || ''} (${p.productId?.productCode || ''}) x ${p.quantity}`
      ).join('; ')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="order_records.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error("Download failed:", error);
    res.status(500).json({ success: false, message: 'Failed to download order records' });
  }
};
exports.getTodayOrders = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const [orders, total] = await Promise.all([
      Order.find({
        orderDate: { $gte: todayStart, $lte: todayEnd },
        isDeleted: false
      })
        .sort({ createdAt: -1 }) // Latest first
        .skip(skip)
        .limit(parseInt(limit))
        .populate("distributor", "username")
        .populate("productList.productId", "productName"),

      Order.countDocuments({
        orderDate: { $gte: todayStart, $lte: todayEnd },
        isDeleted: false
      }),
    ]);

    const formattedOrders = orders.map(order => ({
      orderNumber: order.orderNumber,
      distributor: order.distributor.username,
      status: order.status,
      productList: order.productList.map(item => ({
        productName: item.productId.productName,
        quantity: item.quantity,
      }))
    }));

    res.status(200).json({
      success: true,
      data: formattedOrders,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching today's orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.query.id;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId)
      .populate({
        path: 'distributor',
        select: 'username _id'
      })
      .populate({
        path: 'productList.productId',
        select: 'productName _id'
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};