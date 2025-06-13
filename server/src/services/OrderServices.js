const Order = require('../models/OrderModel');
const { startOfMonth,  endOfDay,format } = require('date-fns');

exports.getNextOrderNumber = async () => {
  try {
    const lastOrder = await Order.findOne()
      .sort({ createdAt: -1 })
      .select('orderNumber');

    const lastNumber = lastOrder ? parseInt(lastOrder.orderNumber, 10) : 999;

    return (lastNumber + 1).toString();
  } catch (error) {
    console.error('Error generating next order number:', error);
    throw error;
  }
};

exports.countPendingOrders = async () => {
  try {
    const count = await Order.countDocuments({ status: 'Pending' });
    return count;
  } catch (error) {
    console.error('Error counting pending orders:', error);
    throw error;
  }
}

exports.getTodaysOrderCount = async () => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Order.countDocuments({
      orderDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    return count;
  } catch (error) {
    console.error('Error getting today\'s order count:', error);
    throw error;
  }
};

exports.calculateOrderPercentageChange = async ()=>{
  const now = new Date();

  // Start of today (midnight)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Start of yesterday (midnight of previous day)
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  // Count today's orders
  const todayCount = await Order.countDocuments({
    orderDate: { $gte: startOfToday }
  });

  // Count yesterday's orders
  const yesterdayCount = await Order.countDocuments({
    orderDate: { $gte: startOfYesterday, $lt: startOfToday }
  });

  // Calculate percentage change
  if (yesterdayCount === 0) {
    return todayCount === 0 ? 0 : 100;
  }
  const percentageChange = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
  return +percentageChange.toFixed(2);

}

exports.calculatePendingOrderPercentageChange = async () => {
  const now = new Date();

  // Start of today (midnight)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Start of yesterday (midnight of previous day)
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  // Count today's pending orders
  const todayCount = await Order.countDocuments({
    orderDate: { $gte: startOfToday },
    status: 'pending'
  });

  // Count yesterday's pending orders
  const yesterdayCount = await Order.countDocuments({
    orderDate: { $gte: startOfYesterday, $lt: startOfToday },
    status: 'pending'
  });

  // Calculate percentage change
  if (yesterdayCount === 0) {
    return todayCount === 0 ? 0 : 100;
  }

  const percentageChange = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
  return +percentageChange.toFixed(2);
};
exports.updateOrderSocket = (req)=>{
    try {
      const io = req.app.get('io');
      io.emit('orderUpdated');
    } catch (socketError) {
      console.warn('Socket emit failed:', socketError.message);
    }
}
exports.getThisMonthDayOrderData = async () => {
  try {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfDay(now); // Include only up to today

    const orders = await Order.aggregate([
      {
        $match: {
          isDeleted: false,
          orderDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" },
            day: { $dayOfMonth: "$orderDate" }
          },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.day": 1 }
      }
    ]);

    const today = now.getDate();
    const result = [];

    for (let day = 1; day <= today; day++) {
      const dateStr = format(new Date(now.getFullYear(), now.getMonth(), day), 'yyyy-MM-dd');
      const found = orders.find(o => o._id.day === day);
      result.push({
        date: dateStr,
        total: found ? found.totalOrders : 0
      });
    }

    return result;
  } catch (err) {
    console.error('Error in getThisMonthDayOrderData:', err);
    throw err;
  }
};

exports.getOrderStatusSummary = async () => {
  try {
    const allStatuses = ['Pending', 'Approved', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Hold'];

    // Aggregate actual counts from DB
    const summary = await Order.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a complete list with zero-filled missing statuses
    const summaryMap = Object.fromEntries(summary.map(item => [item._id, item.count]));

    const completeSummary = allStatuses.map(status => ({
      status,
      count: summaryMap[status] || 0
    }));

    return completeSummary; // e.g. [{ status: "Pending", count: 12 }, ...]
  } catch (error) {
    console.error("Error fetching order status summary:", error);
    return [];
  }
};

