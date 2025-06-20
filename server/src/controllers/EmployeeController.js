const AuthUser = require('../models/AuthUserModel');
const Order = require('../models/OrderModel');
const AuthServices = require('../services/AuthServices')
const LoginSession = require('../models/employee/LoginSessionModel');
const Employee = require('../models/EmployeeModel');
const Product = require('../models/ProductModel');
const ProductOffer = require("../models/ProductOfferModel");
const ProductSlider = require("../models/ProductSliderModel")
const EmployeeServices = require('../services/EmployeeServices');
const TaskServices = require('../services/TaskServices');
const Task = require('../models/employee/TaskModel');
const { startOfToday, endOfDay } = require('date-fns');
const { zonedTimeToUtc } = require('date-fns-tz');
const { endOfMonth, startOfDay } = require('date-fns');
const bcrypt = require("bcryptjs");
const TaskCancelRequest = require("../models/employee/TaskCancelRequest");
const { format, addDays } = require('date-fns');
const LeaveRequest = require("../models/employee/LeaveRequestModel");
const imagekit = require('../config/imagekit');
const LocationService = require('../services/LocationServices')

exports.login = async (req, res) => {
  const { latitude, longitude, deviceInfo } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Need location to activate login' });
  }

  try {
    const token = req.cookies.token;
    const ip = req.ip;

    const userId = AuthServices.getUserIDByToken(token);
    if (!userId) {
      return res.status(404).json({ message: 'Unauthorized: no employeeId' });
    }

    const authUser = await AuthUser.findById(userId);
    if (!authUser || authUser.role !== 'employee' || authUser.roleModel !== 'Employee') {
      return res.status(403).json({ message: 'Only employees can log location' });
    }

    const employeeId = authUser.refId;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.IsActive) {
      return res.json({ message: 'Employee already active' });
    }

    const address = await LocationService.getAddressFromLatLng(latitude, longitude)
      .catch((err) => {
        console.warn("Failed to fetch address:", err.message || err);
        return "Unknown"; // fallback
      });


    // Create and save login session
    const newSession = new LoginSession({
      employeeId,
      loginLocation: {
        latitude,
        longitude
      },
      deviceInfo: deviceInfo || 'Unknown Device',
      ipAddress: ip,
      sessionId: `${employeeId}-${Date.now()}`,
      loginAddress: address
    });

    await newSession.save();

    // Update employee with session ID and mark as active
    employee.IsActive = true;
    employee.CurrentLogin = newSession._id;
    await employee.save();

    return res.status(200).json({
      message: 'Login location saved and employee marked active',
    });

  } catch (err) {
    console.error('Login location error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Logout location is required' });
    }

    const token = req.cookies.token;

    const userId = AuthServices.getUserIDByToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: no employeeId' });
    }

    const authUser = await AuthUser.findById(userId);
    if (!authUser || authUser.role !== 'employee' || authUser.roleModel !== 'Employee') {
      return res.status(403).json({ message: 'Only employees can perform logout' });
    }

    const employeeId = authUser.refId;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (!employee.IsActive || !employee.CurrentLogin) {
      return res.status(400).json({ message: 'Employee is not currently logged in' });
    }

    const session = await LoginSession.findById(employee.CurrentLogin);
    if (!session) {
      return res.status(404).json({ message: 'Login session not found' });
    }

    // Get logout address with fallback
    let logoutAddress = 'Unknown';
    try {
      logoutAddress = await LocationService.getAddressFromLatLng(latitude, longitude);
    } catch (error) {
      console.warn('Reverse geocoding failed during logout:', error?.message || error);
    }

    // Update the login session with logout details
    session.logoutTime = new Date();
    session.logoutLocation = { latitude, longitude };
    session.logoutAddress = logoutAddress;
    await session.save();

    // Update employee state
    employee.IsActive = false;
    employee.CurrentLogin = null;
    await employee.save();

    return res.status(200).json({ message: 'Logout successful, employee marked inactive' });

  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Server error during logout' });
  }
};

exports.checkFieldActive = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token', isActive: false });
    }

    const userId = AuthServices.getUserIDByToken(token);
    if (!userId) {
      return res.status(200).json({ message: 'Unauthorized: Invalid token or IP', isActive: false, });
    }

    const authUser = await AuthUser.findById(userId);
    if (!authUser || authUser.role !== 'employee' || authUser.roleModel !== 'Employee') {
      return res.status(200).json({ message: 'Forbidden: Only employees allowed', isActive: false });
    }

    const employeeId = authUser.refId;
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(200).json({ message: 'Employee not found', isActive: false });
    }

    if (employee.IsActive && employee.CurrentLogin) {
      return res.status(200).json({ message: 'Employee is currently active', isActive: true });
    }

    return res.status(200).json({
      message: 'Employee found but not active',
      isActive: false,
    });

  } catch (err) {
    console.error('Error checking field activity:', err);
    return res.status(500).json({ message: 'Server error while checking employee status' });
  }
}

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = {
      isDeleted: false,
      $or: [
        { productName: { $regex: search, $options: 'i' } },
        { productCode: { $regex: search, $options: 'i' } },
      ],
    };

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      Product.find(query, {
        purchaseRate: 0,
        inStock: 0,
        totalOrders: 0,
        isDeleted: 0,
      })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      products,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addTask = async (req, res) => {
  try {
    const employee = await EmployeeServices.getEmployeeByReq(req);
    if (!employee) {
      return res.status(401).json({ message: 'Unauthorized: No employee' });
    }
    if (!employee.IsActive) {
      return res.status(401).json({ message: 'Unauthorized: Employee not active' });
    }

    const taskId = await TaskServices.getNextTaskId();

    const { title, description, status, address, notes, location } = req.body;

    const now = new Date();

    const newTask = new Task({
      taskId,
      title,
      description,
      assignedTo: employee._id,
      status,
      dueDate: now,
      address,
      notes: notes,
      createdAt: now,
    });

    // Set completion info only if location is present
    if (location && location.latitude && location.longitude) {
      newTask.taskCompletedOn = now;
      newTask.completionLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
      };
    }

    await newTask.save();

    return res.status(201).json({ message: 'Task added successfully', task: newTask });

  } catch (error) {
    console.error('Error adding task:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// exports.getTodayTasks = async (req, res) => {
//   try {
//     const employee = await EmployeeServices.getEmployeeByReq(req);
//     if (!employee) {
//       return res.status(401).json({ message: 'Unauthorized: No employee' });
//     }

//     // Set your actual timezone here, e.g., 'Asia/Kolkata'
//     const TIMEZONE = 'Asia/Kolkata';

//     // Local start and end of today
//     const localStart = startOfToday(); // e.g., 2025-06-03T00:00:00.000 in local tz
//     const localEnd = endOfDay(localStart); // e.g., 2025-06-03T23:59:59.999 in local tz

//     // Convert to UTC for MongoDB query
//     const startDateUtc = zonedTimeToUtc(localStart, TIMEZONE);
//     const endDateUtc = zonedTimeToUtc(localEnd, TIMEZONE);

//     const tasks = await Task.find({
//       assignedTo: employee._id,
//       startDate: {
//         $gte: startDateUtc,
//         $lte: endDateUtc,
//       },
//     }).sort({ createdAt: -1 });

//     return res.status(200).json(tasks);
//   } catch (error) {
//     console.error('Error getting today\'s tasks:', error);
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

exports.getTodayTasks = async (req, res) => {
  try {
    const employee = await EmployeeServices.getEmployeeByReq(req);
    if (!employee) {
      return res.status(401).json({ message: 'Unauthorized: No employee' });
    }

    const TIMEZONE = 'Asia/Kolkata';

    const localStart = startOfToday();       // e.g., 2025-06-21T00:00:00+05:30
    const localEnd = endOfDay(localStart);   // e.g., 2025-06-21T23:59:59.999+05:30

    const startDateUtc = zonedTimeToUtc(localStart, TIMEZONE);
    const endDateUtc = zonedTimeToUtc(localEnd, TIMEZONE);

    const tasks = await Task.find({
      assignedTo: employee._id,
      $or: [
        {
          startDate: {
            $gte: startDateUtc,
            $lte: endDateUtc,
          },
        },
        {
          completionDate: {
            $gte: startDateUtc,
            $lte: endDateUtc,
          },
        },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting today's tasks:", error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};







exports.getPendingTasks = async (req, res) => {
  try {
    const employee = await EmployeeServices.getEmployeeByReq(req);
    if (!employee) {
      return res.status(401).json({ message: 'Unauthorized: No employee' });
    }

    const TIMEZONE = 'UTC'; // You can change to 'Asia/Kolkata', etc.
    const todayLocal = startOfToday();
    const todayUtc = zonedTimeToUtc(todayLocal, TIMEZONE);

    const tasks = await Task.find({
      assignedTo: employee._id,
      startDate: { $lt: todayUtc },
      status: { $nin: ['Cancelled', 'Complete'] }, // ❌ Exclude these statuses
    });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Error getting pending tasks:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateTasksStatus = async (req, res) => {
  try {
    const { status, location, task_id } = req.body;

    // Find the task by taskId
    const task = await Task.findOne({ taskId: task_id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update status
    task.status = status;

    // Handle status 'Complete'
    if (status === 'Complete') {
      // Set the completion date
      task.completionDate = new Date();
      // Ensure location is provided and valid
      if (location && location.latitude && location.longitude) {
        task.completionLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
      } else {
        return res.status(400).json({ message: "Location required for completion" });
      }
     const address = await LocationService.getAddressFromLatLng(location.latitude , location.longitude)
      .catch((err) => {
        console.warn("Failed to fetch address:", err.message || err);
        return "Unknown"; // fallback
      });
     task.completionAdreess=address

    }
    // Optional: Update statusHistory if tracking status changes manually
    task.statusHistory.push({
      status: task.status,
      changedAt: new Date(),
    });

    // Save the task
    await task.save();
    return res.json({ message: "Task status updated successfully" });
  } catch (error) {
    console.error("Error updating task status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.getTaskByMonth = async (req, res) => {
  try {
    const employee = await EmployeeServices.getEmployeeByReq(req);
    if (!employee) {
      return res.status(401).json({ message: 'Unauthorized: No employee' });
    }

    const { month, date } = req.query;

    if (!month || !date) {
      return res.status(400).json({ message: "Missing 'month' or 'date' query parameter" });
    }

    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = endOfMonth(start);

    // Fetch all tasks assigned to the employee within the given month
    const allTasks = await Task.find({
      assignedTo: employee._id,
      startDate: { $gte: start, $lte: end }
    }).lean();

    // 1. Get list of task days (unique dates from startDate)
    const taskDaysSet = new Set(
      allTasks.map(task => task.startDate.toISOString().substring(0, 10))
    );
    const taskDays = Array.from(taskDaysSet);

    // 2. Get tasks for the requested date
    const tasksForDate = allTasks.filter(task =>
      task.startDate.toISOString().substring(0, 10) === date
    );

    return res.json({ taskDays, tasksForDate });

  } catch (err) {
    console.error("Error in getTaskByMonth:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDistributors = async (req, res) => {
  try {
    const { search } = req.query;

    const userFilter = {
      role: 'distributor',
      isDeleted: false,
      isBlock: false,
    };

    if (search) {
      userFilter.username = { $regex: search, $options: 'i' }; // case-insensitive search
    }

    // Find all distributor AuthUsers and populate their Distributor reference
    const authUsers = await AuthUser.find(userFilter)
      .populate({
        path: 'refId',
        model: 'Distributor',
        match: { isDeleted: false, isBlock: false },
        select: 'phone_number address', // fields to pick from Distributor
      })
      .select('username refId'); // pick username and refId only

    // Filter out users where the Distributor info is missing (e.g., soft-deleted)
    const distributors = authUsers
      .filter(user => user.refId) // ensure refId (Distributor) is populated
      .map(user => ({
        name: user.username,
        phone_number: user.refId.phone_number,
        address: user.refId.address,
      }));

    res.status(200).json(distributors);
  } catch (error) {
    console.error('Error fetching distributors:', error);
    res.status(500).json({ message: 'Server error fetching distributors' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { search, status, date, page = 1, limit = 5 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    let filter = { isDeleted: false };

    // Step 1: Date filter
    if (date) {
      const parsedDate = new Date(date);
      filter.orderDate = {
        $gte: startOfDay(parsedDate),
        $lte: endOfDay(parsedDate)
      };
    }

    // Step 2: Get initial orders with populate and sort by latest first
    let orders = await Order.find(filter)
      .sort({ orderDate: -1 }) // Sort by latest first
      .populate({
        path: 'distributor',
        select: 'username'
      })
      .populate({
        path: 'productList.productId',
        select: 'productName productCode'
      });

    // Step 3: Status filter
    if (status && status !== 'All') {
      orders = orders.filter(order => order.status === status);
    }

    // Step 4: Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');

      const matchingUsers = await AuthUser.find({ username: searchRegex }).select('_id');
      const matchingProducts = await Product.find({
        $or: [{ productName: searchRegex }, { productCode: searchRegex }]
      }).select('_id');

      orders = orders.filter(order =>
        searchRegex.test(order.orderNumber) ||
        matchingUsers.some(user => user._id.equals(order.distributor?._id)) ||
        order.productList.some(p =>
          matchingProducts.some(mp => mp._id.equals(p.productId?._id))
        )
      );
    }

    // Step 5: Pagination
    const total = orders.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedOrders = orders.slice(startIndex, startIndex + limitNum);

    // Step 6: Format output
    const formatted = paginatedOrders.map(order => ({
      orderNumber: order.orderNumber,
      distributor: order.distributor?.username || 'Unknown',
      orderDate: order.orderDate,
      status: order.status,
      productList: order.productList.map(p => ({
        productName: p.productId?.productName || 'Unknown',
        quantity: p.quantity
      }))
    }));

    return res.status(200).json({
      data: formatted,
      currentPage: pageNum,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getprofile = async (req, res) => {
  try {
    const employee = await EmployeeServices.getEmployeeByReq(req);

    if (!employee) {
      return res.status(401).json({ message: 'Unauthorized: No employee' });
    }

    // Find auth user using employee._id (linked via refId)
    const authUser = await AuthUser.findOne({
      refId: employee._id,
      role: 'employee',
      isDeleted: false,
    });

    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized: No auth user found' });
    }

    // Compose final profile response
    const profileData = {
      username: authUser.username,
      password: authUser.password, // Consider omitting in production!
      EmployeeID: employee.EmployeeID,
      Name: employee.Name,
      profilePhotoUrl: employee.profilePhotoUrl,
      Email: employee.Email,
      PhoneNumber: employee.PhoneNumber,
      Address: employee.Address,
      Position: employee.Position,
      JoiningDate: employee.JoiningDate,
    };

    return res.status(200).json(profileData);
  } catch (error) {
    console.error('Error getting employee profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const employee = await EmployeeServices.getEmployeeByReq(req);

    if (!employee) {
      return res.status(401).json({ message: "Unauthorized: No employee" });
    }

    const {
      name,
      email,
      phoneNumber,
      address,
      password,
      profileImage, // base64 string
      imageName      // original file name
    } = req.body;

    // Update profile fields if provided
    if (name) employee.Name = name;
    if (email) employee.Email = email;
    if (phoneNumber) employee.PhoneNumber = phoneNumber;
    if (address) employee.Address = address;

    // Handle image update
    if (profileImage && imageName) {
      // Remove old image if it exists
      if (employee.imageFileId) {
        try {
          await imagekit.deleteFile(employee.imageFileId);
        } catch (err) {
          console.warn("Failed to delete old image from ImageKit:", err.message);
        }
      }

      // Upload new image
      try {
        const uploadResponse = await imagekit.upload({
          file: profileImage, // must be base64 without prefix
          fileName: imageName,
          folder: "/employee-profiles"
        });

        employee.profilePhotoUrl = uploadResponse.url;
        employee.imageFileId = uploadResponse.fileId;
      } catch (uploadError) {
        console.error("ImageKit upload failed:", uploadError.message);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    await employee.save();

    // Handle password update
    if (password) {
      const authUser = await AuthUser.findOne({
        refId: employee._id,
        role: "employee",
      });

      if (!authUser) {
        return res.status(404).json({ message: "AuthUser record not found for employee" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      authUser.password = hashedPassword;
      await authUser.save();
    }

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.cancelTaskRequest = async (req, res) => {
  try {
    const employee = await EmployeeServices.getEmployeeByReq(req);
    if (!employee) {
      return res.status(401).json({ message: "Unauthorized: No employee" });
    }

    const { taskId, reason } = req.body;

    // Get full task object based on taskId (string)
    const task = await Task.findOne({ taskId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Generate next cancel request ID
    const requestId = await TaskServices.getNextTaskCancelRequestId();

    // Create cancel request entry
    const cancelRequest = new TaskCancelRequest({
      requestId,
      taskId: task.taskId,
      employeeId: employee._id,
      reason: reason || "",
    });

    await cancelRequest.save();

    return res.status(200).json({
      message: "Task cancel request submitted successfully",
      requestId,
    });
  } catch (error) {
    console.error("Error in cancelTaskRequest:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTaskCancelrequests = async (req, res) => {
  try {
    const employee = await EmployeeServices.getEmployeeByReq(req);

    if (!employee) {
      return res.status(401).json({ message: "Unauthorized: No employee" });
    }

    const { q = '', status, page = 1, limit = 5 } = req.query;

    const query = { employeeId: employee._id };

    if (q.trim() !== '') {
      const searchRegex = new RegExp(q.trim(), "i");
      query.$or = [{ requestId: searchRegex }, { taskId: searchRegex }];
    }

    if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await TaskCancelRequest.countDocuments(query);

    const cancelRequests = await TaskCancelRequest.find(query)
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: cancelRequests,
    });
  } catch (error) {
    console.error("Error fetching cancel task requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getEmployeeWorkByMonth = async (req, res) => {
  try {
    const employee = await EmployeeServices.getEmployeeByReq(req);
    if (!employee) {
      return res.status(401).json({ message: "Unauthorized: No employee" });
    }

    const month = req.query.month; // format: "YYYY-MM"
    if (!month) {
      return res.status(400).json({ message: "Missing 'month' query parameter (format: YYYY-MM)" });
    }

    const timeZone = "Asia/Kolkata";

    const startDateLocal = new Date(`${month}-01T00:00:00`);
    const endDateLocal = endOfMonth(startDateLocal);

    const result = [];

    for (let day = startDateLocal; day <= endDateLocal; day = addDays(day, 1)) {
      const dayStart = zonedTimeToUtc(startOfDay(day, { timeZone }), timeZone);
      const dayEnd = zonedTimeToUtc(endOfDay(day, { timeZone }), timeZone);

      const hasLogin = await LoginSession.findOne({
        employeeId: employee._id,
        loginTime: { $gte: dayStart, $lte: dayEnd },
      });

      const dateKey = format(day, "yyyy-MM-dd");
      result.push({ [dateKey]: !!hasLogin });
    }

    res.json(result);

  } catch (error) {
    console.error("Error in getEmployeeWorkByMonth:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getEmployeeWorkByDay = async (req, res) => {
  try {
    const employee = await EmployeeServices.getEmployeeByReq(req);
    if (!employee) {
      return res.status(401).json({ message: "Unauthorized: No employee" });
    }

    const day = req.query.day; // expected format: "2025-06-05"
    if (!day) {
      return res.status(400).json({ message: "Missing 'day' query parameter" });
    }

    // Get start and end of the day
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    // Find login sessions for the day
    const loginSessions = await LoginSession.find({
      employeeId: employee._id,
      loginTime: { $gte: dayStart, $lte: dayEnd },
    });

    // Find tasks completed on the day
    const tasks = await Task.find({
      assignedTo: employee._id,
      completionDate: { $gte: dayStart, $lte: dayEnd },
    });

    return res.json({ loginSessions, tasks });
  } catch (error) {
    console.error("Error in getEmployeeWorkByDay:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.saveEmployeeLeaveRequest = async (req, res) => {
  try {
    const employee = await EmployeeServices.getEmployeeByReq(req);
    if (!employee) {
      return res.status(401).json({ message: "Unauthorized: No employee" });
    }

    const requestId = await EmployeeServices.getNextLeaveRequestId();

    // Extract fields from req.body
    const { leaveType, startDate, endDate, reason } = req.body;

    // Validate required fields
    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0); // today at midnight
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (start < now) {
      return res.status(400).json({ message: "Start date cannot be in the past." });
    }
    if (end < now) {
      return res.status(400).json({ message: "End date cannot be in the past." });
    }
    if (end < start) {
      return res.status(400).json({ message: "End date cannot be before start date." });
    }

    // Create new LeaveRequest document
    const newLeaveRequest = new LeaveRequest({
      requestId,
      employeeId: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason: reason || "",
      // status defaults to "Pending"
    });

    // Save to DB
    const savedRequest = await newLeaveRequest.save();

    return res.status(201).json(savedRequest);
  } catch (error) {
    console.error("Error saving leave request:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getEmployeeLeaveRequest = async (req, res) => {
  try {
    const employee = await EmployeeServices.getEmployeeByReq(req);
    if (!employee) {
      return res.status(401).json({ message: "Unauthorized: No employee" });
    }

    // Find leave requests for this employee, excluding deleted ones
    const leaveRequests = await LeaveRequest.find({
      employeeId: employee._id,
      isDeleted: false,
    })
      .sort({ appliedAt: -1 }) // newest first
      .exec();

    return res.json(leaveRequests);
  } catch (error) {
    console.error("Error getting leave requests:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const employee = await EmployeeServices.getEmployeeByReq(req);
    if (!employee) {
      return res.status(401).json({ message: "Unauthorized: No employee" });
    }

    const offers = await ProductOffer.find({}).sort({ createdAt: -1 });

    const sliders = await ProductSlider.find({})
      .populate({
        path: 'productList',
        select: '-totalOrders -itemRate -purchaseRate -__v',
      })
      .lean();

    const data = {
      name: employee.Name,
      offers: offers.map(offer => ({
        _id: offer._id,
        description: offer.description,
        image: offer.image,
        validTill: offer.validTill,
      })),
      productSliders: sliders,
    };

    return res.json(data);
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getTodayLoginSession = async (req, res) => {
  try {
    const employee = await EmployeeServices.getEmployeeByReq(req);
    if (!employee) {
      return res.status(401).json({ message: "Unauthorized: No employee" });
    }

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const sessions = await LoginSession.find({
      employeeId: employee._id,
      loginTime: { $gte: todayStart, $lte: todayEnd },
    }).sort({ loginTime: -1 }); // latest first

    // Latest session details (optional, for summary)
    const latestSession = sessions[0];

    return res.json({
      isActive: employee.IsActive,
      loginTime: latestSession?.loginTime || null,
      logoutTime: latestSession?.logoutTime || null,
      loginLocation: latestSession?.loginLocation
        ? `${latestSession.loginLocation.latitude}, ${latestSession.loginLocation.longitude}`
        : null,
      logoutLocation: latestSession?.logoutLocation
        ? `${latestSession.logoutLocation.latitude}, ${latestSession.logoutLocation.longitude}`
        : null,
      allSessions: sessions.map(session => ({
        loginTime: session.loginTime,
        logoutTime: session.logoutTime,
        loginLocation: session.loginLocation
          ? `${session.loginLocation.latitude}, ${session.loginLocation.longitude}`
          : null,
        logoutLocation: session.logoutLocation
          ? `${session.logoutLocation.latitude}, ${session.logoutLocation.longitude}`
          : null,
      }))
    });
  } catch (err) {
    console.error("Error fetching today's login session:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.saveLiveLocation = async (req, res) => {
  try {
    const employee = await EmployeeServices.getEmployeeByReq(req);
    if (!employee) {
      return res.status(401).json({ message: "Unauthorized: No employee" });
    }

    const { latitude, longitude } = req.body;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      return res.status(400).json({ message: "Invalid latitude or longitude" });
    }

    // Save the live location to employee record
    employee.liveLocation = {
      latitude,
      longitude,
      timestamp: new Date(),
    };

    await employee.save();

    EmployeeServices.updateEmployeeDataSocket(req)

    return res.json({ message: "Live location saved successfully" });
  } catch (error) {
    console.error("Error saving live location:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};