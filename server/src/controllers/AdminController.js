const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
const Distributor = require('../models/DistributorModel');
const AuthUser = require('../models/AuthUserModel');
const Product = require('../models/ProductModel');
const Order = require('../models/OrderModel');
const Admin = require('../models/AdminModel')
const Notification = require('../models/NotificationModel');

const AuthServices = require('../services/AuthServices')
const OrderServices = require('../services/OrderServices')
const StockServices = require ('../services/StockServices')
const DistributorServices = require('../services/DistributorServices')
const SocketServices = require('../services/SocketServices')

exports.getAdminProfile = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Token is required" });
    }

    const userId = await AuthServices.getUserIDByToken(token);

    if (!userId) {
      return res.status(401).json({ error: "Invalid token or IP" });
    }

    const authUser = await AuthUser.findById(userId);
    if (!authUser || authUser.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const admin = await Admin.findById(authUser.refId);
    if (!admin) {
      return res.status(404).json({ error: "Admin profile not found" });
    }

    return res.json({
      username: authUser.username,
      email: authUser.email || "",
      name: admin.name
    });

  } catch (error) {
    console.error("Error in getAdminProfile:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = await AuthServices.getUserIDByToken(token);
    const { username, name, password, email } = req.body;

    if (!username && !name && !password && !email) {
      return res.status(400).json({ message: "No data to update" });
    }

    const authUser = await AuthUser.findById(userId);
    if (!authUser || authUser.role !== "admin") {
      return res.status(404).json({ message: "Admin user not found" });
    }

    // Update username if provided
    if (username) {
      authUser.username = username;
    }

    // Update email if provided
    if (email) {
      authUser.email = email;
    }

    // Update password if provided
    if (password) {
      authUser.password = await bcrypt.hash(password, 10);
    }

    await authUser.save();

    // Update Admin name
    const admin = await Admin.findById(authUser.refId);
    if (!admin) {
      return res.status(404).json({ message: "Admin profile not found" });
    }

    if (name) {
      admin.name = name;
      await admin.save();
    }

    return res.json({ message: "Admin profile updated successfully" });

  } catch (error) {
    console.error("Error updating admin profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAdminDashboardData = async (req, res) => {
  const adminData = {
    Pending_Orders_Count: await OrderServices.countPendingOrders(),
    stockData :await StockServices.getTodayStockTotals(),
    newOrders : await OrderServices.getTodaysOrderCount(),
    newPercentageChange: await OrderServices.calculateOrderPercentageChange(),
    pendingOrderPercentageChange: await OrderServices.calculatePendingOrderPercentageChange(),
    orderChartData: await OrderServices.getThisMonthDayOrderData(),
    OrderStatusSummary: await OrderServices.getOrderStatusSummary(),
  }
      
  return res.json(adminData)
}

exports.getAdminNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page * limit;

    // Find the default admin (assuming only one admin)
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Fetch notifications
    const notifications = await Notification.find({
      recipient: admin._id,
      recipientModel: 'Admin'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count (for frontend to determine if more pages exist)
    const total = await Notification.countDocuments({
      recipient: admin._id,
      recipientModel: 'Admin'
    });

    return res.status(200).json({
      notifications,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return res.status(500).json({ message: 'Server error while fetching notifications' });
  }
};

exports.getAdminNotificationsCount = async (req, res) => {
  try {
    // Get the default admin (assuming there's only one)
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Count notifications where recipient is the admin and isSeen is false
    const count = await Notification.countDocuments({
      recipient: admin._id,
      recipientModel: 'Admin',
      isSeen: false,
    });

    return res.json({ count });
  } catch (error) {
    console.error("Error fetching admin notification count:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateAdminNotificationsSeen = async (req, res) => {
  try {
    const { Notification_id } = req.query;

    if (!Notification_id) {
      return res.status(400).json({ message: 'Notification_id is required' });
    }

    const updated = await Notification.findByIdAndUpdate(
      Notification_id,
      { isSeen: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }
       SocketServices.updateAdminNotificationSocket(req);
    return res.status(200).json({});
  } catch (error) {
    console.error("Error updating notification:", error);
    return res.status(500).json({ message: 'Server error' });
  }
};














