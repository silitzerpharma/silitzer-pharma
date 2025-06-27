const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Employee = require('../../models/EmployeeModel');
const AuthUser = require('../../models/AuthUserModel');
const LoginSession = require('../../models/employee/LoginSessionModel')
const Task = require('../../models/employee/TaskModel')
const TaskCancelRequest = require('../../models/employee/TaskCancelRequest');
const LeaveBalance = require("../../models/employee/LeaveBalanceModel")
const LeaveRequest = require("../../models/employee/LeaveRequestModel");

const XLSX = require('xlsx');

const AuthServices = require('../../services/AuthServices');
const EmployeeServices = require('../../services/EmployeeServices');
const TaskServices = require('../../services/TaskServices')

;
const { startOfToday, endOfToday,  startOfDay, endOfDay ,subDays, eachDayOfInterval, isSameDay} = require('date-fns');
const { utcToZonedTime,format } = require('date-fns-tz');
const TIMEZONE = 'Asia/Kolkata';
const { zonedTimeToUtc } = require('date-fns-tz');
const timeZone = 'Asia/Kolkata'; // IST timezone



exports.addEmployee = async (req, res) => {
  const employeeDetails = req.body.employeeDetails;

  if (!employeeDetails) {
    return res.status(400).json({ msg: "Request body is missing" });
  }

  const {
    Name,
    profilePhotoUrl,
    Email,
    PhoneNumber,
    Address,
    Position,
    JoiningDate,
    UserName,
    Password
  } = employeeDetails;

  if (!UserName || !Password) {
    return res.status(400).json({ msg: "Username and password are required" });
  }

  const usernameExists = await AuthServices.checkUsernamePresent(UserName);
  if (usernameExists) {
    return res.status(400).json({ msg: "Username already present" });
  }

  try {
    // Generate next Employee ID
    const EmployeeID = await EmployeeServices.getNextEmployeeId();

    // Save employee
    const newEmployee = new Employee({
      EmployeeID,
      Name,
      profilePhotoUrl,
      Email,
      PhoneNumber,
      Address,
      Position,
      JoiningDate
    });

    const savedEmployee = await newEmployee.save();

    // Hash password and save auth user
    const hashedPassword = await bcrypt.hash(Password, 10);

    const newAuthUser = new AuthUser({
      username: UserName,
      password: hashedPassword,
      role: 'employee',
      refId: savedEmployee._id,
      roleModel: 'Employee',
    });

    await newAuthUser.save();

    return res.status(200).json({ msg: "Employee created successfully" });
  } catch (err) {
    console.error("Error saving employee:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const searchRegex = new RegExp(search, 'i'); // case-insensitive search
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Step 1: Get all employee users with populated refId
    const authUsers = await AuthUser.find({
      role: 'employee',
      isDeleted: false,
    })
      .populate({
        path: 'refId',
        model: 'Employee',
        match: { isDeleted: false },
        select: 'EmployeeID Name IsActive liveLocation',
      })
      .select('username refId');

    // Step 2: Apply in-memory filtering based on search
    const filteredUsers = authUsers.filter((user) => {
      const usernameMatch = searchRegex.test(user.username);
      const employeeIDMatch = user.refId?.EmployeeID && searchRegex.test(user.refId.EmployeeID);
      const nameMatch = user.refId?.Name && searchRegex.test(user.refId.Name);
      return usernameMatch || employeeIDMatch || nameMatch;
    });

    // Step 3: Pagination
    const total = filteredUsers.length;
    const paginatedUsers = filteredUsers.slice((pageNumber - 1) * limitNumber, pageNumber * limitNumber);

    // Step 4: Get today's login sessions
    const startOfDay = startOfToday();
    const endOfDay = endOfToday();
    const sessions = await LoginSession.find({
      loginTime: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ loginTime: -1 });

    const latestSessionMap = new Map();
    for (const session of sessions) {
      const empId = session.employeeId.toString();
      if (!latestSessionMap.has(empId)) {
        latestSessionMap.set(empId, session);
      }
    }

    // Step 5: Format result (including current task)
    const formatted = await Promise.all(
      paginatedUsers
        .filter(e => e.refId !== null)
        .map(async (e) => {
          const employeeObjectId = e.refId._id.toString();
          const todayLogin = latestSessionMap.get(employeeObjectId) || null;
          const task = await EmployeeServices.getCurrentTask(e.refId._id); 
          return {
            username: e.username,
            EmployeeID: e.refId.EmployeeID,
            Name: e.refId.Name,
            IsActive: e.refId.IsActive,
            employee_id: e._id,
            EmployeeObjectId: e.refId._id,
            todayLogin,
            task, 
            liveLocation:e.refId.liveLocation,
          };
        })
    );

    res.json({
      total,
      page: pageNumber,
      limit: limitNumber,
      employees: formatted,
    });
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllEmployeeData = async (req, res) => {
  try {
    const { EmployeeID } = req.body;  // AuthUser._id

    if (!EmployeeID || !mongoose.Types.ObjectId.isValid(EmployeeID)) {
      return res.status(400).json({ message: 'Valid EmployeeID (AuthUser _id) is required' });
    }

    const authUser = await AuthUser.findOne({ _id: EmployeeID, isDeleted: false});
    if (!authUser) {
      return res.status(404).json({ message: 'AuthUser not found or inactive' });
    }

    const employee = await Employee.findOne({ _id: authUser.refId, isDeleted: false});
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const RequestCount = await EmployeeServices.getRequestCount(employee._id);

    return res.status(200).json({ 
      success: true, 
      data: {
        employee,
        username: authUser.username ,
        requestcount:RequestCount
      }
    });

  } catch (error) {
    console.error('Error fetching employee data:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateEmployeeData = async (req, res) => {
  try {
    const { employeeId, employee, username, password } = req.body;

    if (!employeeId || !employee || !employee._id || !username) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(employeeId) ||
      !mongoose.Types.ObjectId.isValid(employee._id)
    ) {
      return res.status(400).json({ error: "Invalid IDs" });
    }

    // Parse JoiningDate if provided (support both ISO and dd/mm/yyyy)
    let joiningDate = null;
    if (employee.JoiningDate) {
      if (
        typeof employee.JoiningDate === "string" &&
        employee.JoiningDate.includes("T")
      ) {
        joiningDate = new Date(employee.JoiningDate);
      } else {
        const parts = employee.JoiningDate.split("/");
        if (parts.length === 3) {
          const [dd, mm, yyyy] = parts;
          joiningDate = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
        }
      }
      if (isNaN(joiningDate.getTime())) {
        return res.status(400).json({ error: "Invalid JoiningDate format" });
      }
    }

    // Update Employee document
    const updateData = {
      Name: employee.Name,
      Email: employee.Email,
      PhoneNumber: employee.PhoneNumber,
      Position: employee.Position,
      Address: employee.Address,
      profilePhotoUrl: employee.profilePhotoUrl || "",
      IsActive: employee.IsActive,
      isBlock: employee.isBlock,
    };
    if (joiningDate) {
      updateData.JoiningDate = joiningDate;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employee._id,
      updateData,
      { new: true }
    );
    if (!updatedEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Update AuthUser
    const authUser = await AuthUser.findById(employeeId);
    if (!authUser) {
      return res.status(404).json({ error: "Auth user not found" });
    }

    if (username !== authUser.username) {
      const existingUser = await AuthUser.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      authUser.username = username;
    }

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      authUser.password = hashedPassword;
    }

    await authUser.save();

    return res.status(200).json({
      message: "Employee and AuthUser updated successfully",
      employee: updatedEmployee,
    });
  } catch (err) {
    console.error("Error updating employee:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ error: 'Invalid or missing employeeId' });
    }

    // Find AuthUser by employeeId
    const authUser = await AuthUser.findById(employeeId);
    if (!authUser) {
      return res.status(404).json({ error: 'AuthUser not found' });
    }
       console.log(authUser);
    // Update username with "username+del+timestamp"
    const timestamp = Date.now();
    authUser.username = `${authUser.username}+del+${timestamp}`;
    authUser.isDeleted = true;
    await authUser.save();

    // Find Employee by authUser.refId and mark as deleted
    const employee = await Employee.findById(authUser.refId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    employee.isDeleted = true;
    await employee.save();

    return res.status(200).json({ message: 'Employee and AuthUser marked as deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.blockEmployee = async (req, res) => {
  try {
    const { employeeId, isBlock } = req.body;

    if (!employeeId || typeof isBlock !== 'boolean') {
      return res.status(400).json({ error: 'Invalid or missing employeeId or isBlock' });
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ error: 'Invalid employeeId format' });
    }

    // Find AuthUser
    const authUser = await AuthUser.findById(employeeId);
    if (!authUser) {
      return res.status(404).json({ error: 'AuthUser not found' });
    }

    // Update isBlock on AuthUser
    authUser.isBlock = isBlock;
    await authUser.save();

    // Find Employee by refId and update isBlock
    const employee = await Employee.findById(authUser.refId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    employee.isBlock = isBlock;
    await employee.save();

    return res.status(200).json({ message: `Employee block status updated to ${isBlock}` });
  } catch (error) {
    console.error('Error updating block status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.AssignTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      startDate,
      dueDate,
      address,
      taskType,
      employeeObjectId,
    } = req.body;

    if (!title || !employeeObjectId) {
      return res.status(400).json({ message: 'Title and employeeObjectId are required' });
    }

    let status = 'Assigned';

    if (taskType === 'Scheduled') {
      if (!startDate) {
        return res.status(400).json({ message: 'Start date is required for scheduled tasks' });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      if (start <= today) {
        return res.status(400).json({ message: 'Start date must be after today for scheduled tasks' });
      }

      status = 'Scheduled';
    }

    // Validate priority or assign default 'Medium'
    const validPriorities = ['Low', 'Medium', 'High'];
    const priorityValue = validPriorities.includes(priority) ? priority : 'Medium';

    const taskId = await TaskServices.getNextTaskId();

    const newTask = new Task({
      taskId,
      title,
      description,
      assignedTo: employeeObjectId,
      status,
      priority: priorityValue,
      startDate, // Save startDate in DB if available
      dueDate,
      address,
      statusHistory: [{ status: 'Assigned' }],
    });

    await newTask.save();

    return res.status(201).json({
      message: 'Task assigned successfully',
    });
  } catch (error) {
    console.error('Error assigning task:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getEmployeeTasks = async (req, res) => {
  const { employee_id, date, status, search, page = 1, limit = 5 } = req.query;

  try {
    if (!employee_id) {
      return res.status(400).json({ message: 'employee_id is required' });
    }

    const query = {
      assignedTo: employee_id,
    };

    if (status) {
      query.status = status;
    }

    if (date) {
      const selectedDate = new Date(date);
      const nextDate = new Date(selectedDate);
      nextDate.setDate(selectedDate.getDate() + 1);

      query.$or = [
        { dueDate: { $gte: selectedDate, $lt: nextDate } },
        { taskCompletedOn: { $gte: selectedDate, $lt: nextDate } }
      ];
    }

    if (search) {
      query.taskId = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tasks, totalCount] = await Promise.all([
      Task.find(query)
        .sort({ createdAt: -1 }) // Sort by newest created tasks first
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(query),
    ]);

    return res.status(200).json({
      tasks,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching employee tasks:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateEmployeeTask = async (req, res) => {
  try {
    const {
      _id,
      title,
      description,
      status,
      priority,
      dueDate,
      taskCompletedOn,
      address,
      notes
    } = req.body;

    if (!_id) {
      return res.status(400).json({ message: 'Task _id is required' });
    }

    const task = await Task.findById(_id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Determine the new status, fallback to existing if not provided
    const newStatus = (typeof status !== 'undefined' && status !== null) ? status : task.status;

    // Reject if taskCompletedOn is set but status is not 'Complete'
    if (
      taskCompletedOn &&
      newStatus.toLowerCase() !== 'complete'
    ) {
      return res.status(400).json({
        message: 'Cannot set taskCompletedOn unless status is Complete'
      });
    }

    // Update fields
    task.title = title || task.title;
    task.description = description || task.description;

    // Only update status if explicitly provided in request
    if (typeof status !== 'undefined' && status !== null) {
      task.status = status;
    }

    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.address = address || task.address;
    task.notes = notes || task.notes;

    let taskCompletedSaved = false;

    // Set taskCompletedOn only if status is complete
    if (newStatus.toLowerCase() === 'complete') {
      task.taskCompletedOn = taskCompletedOn || new Date();
      taskCompletedSaved = true;
    }

    const updatedTask = await task.save();

    return res.status(200).json({
      message: 'Task updated successfully',
      task: updatedTask,
      taskCompletedSaved: taskCompletedSaved
    });

  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.removeEmployeeTask = async (req, res) => {
  try {
    const { task_id } = req.body;

    if (!task_id) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const deletedTask = await Task.findByIdAndDelete(task_id);

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getEmployeeTodaysActivity = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: "employeeId is required" });
    }

    const timeZone = "Asia/Kolkata";
    const now = new Date();
    const zonedNow = utcToZonedTime(now, timeZone);

    const istStart = startOfDay(zonedNow);
    const istEnd = endOfDay(zonedNow);

    const startOfTodayUTC = zonedTimeToUtc(istStart, timeZone);
    const endOfTodayUTC = zonedTimeToUtc(istEnd, timeZone);

    // 🔹 Filter out Complete & Cancelled
    const excludedStatuses = ["Complete", "Cancelled"];

    const tasks = await Task.find({
      assignedTo: employeeId,
      startDate: { $gte: startOfTodayUTC, $lte: endOfTodayUTC },
    }).sort({ dueDate: 1 });

    
    const pendingTasks = await Task.find({
      assignedTo: employeeId,
      startDate: { $lt: startOfTodayUTC },
      status: { $nin: excludedStatuses },
    }).sort({ startDate: 1 });

    const sessions = await LoginSession.find({
      employeeId,
      loginTime: { $gte: startOfTodayUTC, $lte: endOfTodayUTC },
    }).sort({ loginTime: 1 });

    return res.json({ tasks, pendingTasks, sessions });
  } catch (error) {
    console.error("Error fetching employee tasks or sessions for today:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
exports.getEmployeedaysActivity = async (req, res) => {
  try {
    const { employeeId, day } = req.body;

    if (!employeeId || !day) {
      return res.status(400).json({ error: 'employeeId and day are required' });
    }

    const date = new Date(day);
    if (isNaN(date)) {
      return res.status(400).json({ error: 'Invalid day format' });
    }

    const timeZone = 'Asia/Kolkata'; // IST

    // Get the start and end of the day in IST
    const startIST = startOfDay(date);
    const endIST = endOfDay(date);

    // Convert to UTC for querying MongoDB
    const startUTC = zonedTimeToUtc(startIST, timeZone);
    const endUTC = zonedTimeToUtc(endIST, timeZone);

    const tasks = await Task.find({
      assignedTo: employeeId,
      completionDate: {
        $gte: startUTC,
        $lte: endUTC
      }
    }).sort({ completionDate: 1 });

    const sessions = await LoginSession.find({
      employeeId,
      loginTime: {
        $gte: startUTC,
        $lte: endUTC
      }
    }).sort({ loginTime: 1 });

    return res.json({ tasks, sessions });

  } catch (error) {
    console.error('Error fetching employee tasks or sessions for the day:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getEmployeeWorkSessions = async (req, res) => {
  try {
    const { employeeId, page = 1, limit = 10, startDate, endDate } = req.query;

    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId is required' });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // ✅ Convert startDate and endDate to IST then to UTC range
   const istFrom = startDate ? new Date(startDate) : employee.createdAt;
    const istTo = endDate ? new Date(endDate) : subDays(new Date(), 1);

    const istStart = startOfDay(istFrom, { timeZone: TIMEZONE });
    const istEnd = endOfDay(istTo, { timeZone: TIMEZONE });

    const startDateUTC = zonedTimeToUtc(istStart, TIMEZONE);
    const endDateUTC = zonedTimeToUtc(istEnd, TIMEZONE);

    // Get all IST-based days between range
    const allDaysUTC = eachDayOfInterval({ start: startDateUTC, end: endDateUTC });

    // Fetch all login sessions in UTC range
    const sessions = await LoginSession.find({
      employeeId: employee._id,
      loginTime: { $gte: startDateUTC, $lte: endDateUTC },
    })
      .sort({ loginTime: 1 })
      .lean();

    // ✅ Group sessions by IST date
    const sessionsByDate = {};
    sessions.forEach((session) => {
      const istDate = format(utcToZonedTime(session.loginTime, TIMEZONE), 'yyyy-MM-dd');
      if (!sessionsByDate[istDate]) sessionsByDate[istDate] = [];
      sessionsByDate[istDate].push(session);
    });

    // ✅ Create all IST local date strings (reversed for latest-first pagination)
    const allLocalDates = allDaysUTC.map((utcDay) =>
      format(utcToZonedTime(utcDay, TIMEZONE), 'yyyy-MM-dd')
    ).reverse();

    const totalDays = allLocalDates.length;
    const pagedDates = allLocalDates.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const workSessions = pagedDates.map((dateStr) => {
      const daySessions = sessionsByDate[dateStr] || [];
      if (daySessions.length === 0) {
        return {
          date: dateStr,
          loginTime: null,
          loginLocation: null,
          loginAddress: null,
          logoutTime: null,
          logoutLocation: null,
          logoutAddress: null,
        };
      }

      const first = daySessions[0];
      const last = daySessions[daySessions.length - 1];

      return {
        date: dateStr,
        loginTime: first.loginTime,
        loginLocation: first.loginLocation || null,
        loginAddress: first.loginAddress || null,
        logoutTime: last.logoutTime || null,
        logoutLocation: last.logoutLocation || null,
        logoutAddress: last.logoutAddress || null,
      };
    });

    return res.json({
      employeeId,
      totalDays,
      page: pageNum,
      limit: limitNum,
      workSessions,
    });
  } catch (error) {
    console.error("Error fetching work sessions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getEmployeeLeave = async (req, res) => {
  try {
    const { employeeId, fromDate, toDate, status, page = 1, limit = 5 } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: "employeeId is required in query parameters" });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 5;
    const skip = (pageNum - 1) * limitNum;

    // Fetch leave balance
    const leaveBalance = await LeaveBalance.findOne({ employeeId });

    // Build leave request filter
    const filter = {
      employeeId,
      isDeleted: false,
    };

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    // Add date range filter if present
    if (fromDate || toDate) {
      filter.startDate = {};
      if (fromDate) filter.startDate.$gte = new Date(fromDate);
      if (toDate) filter.startDate.$lte = new Date(toDate);
    }

    // Count total filtered leave requests for pagination
    const totalCount = await LeaveRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limitNum);

    // Fetch leave requests with pagination
    const leaveRequests = await LeaveRequest.find(filter)
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Fetch leave summary counts
    const leaves = await EmployeeServices.getLeaves(employeeId);

    return res.json({
      leaveBalance: leaveBalance || {
        casual: 0,
        sick: 0,
        earned: 0,
        unpaid: 0,
      },
      leaves,
      leaveRequests,
      totalPages,
    });
  } catch (err) {
    console.error("Error fetching employee leave:", err);
    return res.status(500).json({ message: "Server error fetching leave data" });
  }
};

exports.getEmployeeRequests = async (req, res) => {
  const { employeeId } = req.query;  // getting employeeId from query params

  if (!employeeId) {
    return res.status(400).json({ error: 'Missing employeeId parameter' });
  }

  try {
    const cancelRequests = await TaskCancelRequest.find({
      employeeId,
      status: 'Pending'
    }).lean();

    const taskIds = cancelRequests.map(r => r.taskId);

    const tasks = await Task.find({ taskId: { $in: taskIds } }).lean();

    const taskMap = tasks.reduce((acc, task) => {
      acc[task.taskId] = task;
      return acc;
    }, {});

    const enrichedCancelRequests = cancelRequests.map(req => ({
      ...req,
      task: taskMap[req.taskId] || null,
    }));

    const leaveRequests = await LeaveRequest.find({
      employeeId,
      status: 'Pending',
      isDeleted: false
    }).lean();

    const leaveBalance = await LeaveBalance.findOne({ employeeId }).lean();

    res.json({
      cancelRequests: enrichedCancelRequests,
      leaveRequests,
      leaveBalance,
    });
  } catch (err) {
    console.error('Error in getEmployeeRequests:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateTaskCancelRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    if (!requestId || !["Approved", "Rejected"].includes(action)) {
      return res.status(400).json({ error: "Invalid requestId or action" });
    }
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ error: "Invalid ObjectId format" });
    }
    const request = await TaskCancelRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Cancel request not found" });
    }
    if (request.status !== "Pending") {
      return res.status(400).json({ error: "Only pending requests can be updated" });
    }
    // Update the request
    request.status = action;
    request.reviewedAt = new Date();
    await request.save();
    // If approved, update the related task
    if (action === "Approved") {
      const task = await Task.findOne({ taskId: request.taskId });
      if (!task) {
        return res.status(404).json({ error: "Associated task not found" });
      }

      task.status = "Cancelled";
      task.statusHistory.push({ status: "Cancelled", changedAt: new Date() });
      await task.save();
    }

    return res.json({ message: "Request processed successfully", request });

  } catch (error) {
    console.error("Error updating task cancel request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateLeaveRequest = async (req, res) => {
  try {
    const { _id, action, rejectionReason } = req.body;

    if (!_id || !["Approved", "Rejected"].includes(action)) {
      return res.status(400).json({ error: "Invalid _id or action" });
    }

    const leaveRequest = await LeaveRequest.findById(_id);
    if (!leaveRequest) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    if (leaveRequest.status !== "Pending") {
      return res.status(400).json({ error: "Only pending requests can be updated" });
    }

    leaveRequest.status = action;
    leaveRequest.reviewedAt = new Date();

    if (action === "Rejected") {
      leaveRequest.rejectionReason = rejectionReason || "No reason provided";
    } else {
      leaveRequest.rejectionReason = undefined;
    }

    await leaveRequest.save();

    return res.json({ message: `Leave request ${action.toLowerCase()} successfully`, leaveRequest });
  } catch (error) {
    console.error("Error updating leave request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.downloadWorkSessions = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: 'employeeId is required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const today = new Date();
    const employeeJoinDate = new Date(employee.JoiningDate);

    let start, end;

    if (startDate && endDate) {
      // Use given range
      start = new Date(startDate);
      end = new Date(endDate);
    } else if (startDate) {
      // Use only start day
      start = new Date(startDate);
      end = new Date(startDate);
    } else if (endDate) {
      // Use only end day
      start = new Date(endDate);
      end = new Date(endDate);
    } else {
      // Default: all data from joining date to today
      start = employeeJoinDate;
      end = today;
    }

    // Make sure we include the entire end day
    end.setHours(23, 59, 59, 999);

    // ✅ Fetch login sessions
    const sessions = await LoginSession.find({
      employeeId,
      loginTime: { $gte: start, $lte: end }
    }).lean();

    // ✅ Fetch completed tasks
    const tasks = await Task.find({
      assignedTo: employeeId,
      status: 'Complete',
      completionDate: { $gte: start, $lte: end }
    }).lean();

    // ✅ Format session data
    const sessionSheetData = sessions.map(session => ({
      Date: session.loginTime?.toDateString() || 'N/A',
      LoginTime: session.loginTime?.toLocaleString() || 'N/A',
      LogoutTime: session.logoutTime?.toLocaleString() || 'N/A',
      LoginLocation: session.loginLocation
        ? `Lat: ${session.loginLocation.latitude}, Lng: ${session.loginLocation.longitude}`
        : 'N/A',
      LogoutLocation: session.logoutLocation
        ? `Lat: ${session.logoutLocation.latitude}, Lng: ${session.logoutLocation.longitude}`
        : 'N/A',
      Device: session.deviceInfo || 'N/A',
      IP: session.ipAddress || 'N/A'
    }));

    // ✅ Format task data
    const taskSheetData = tasks.map(task => ({
      TaskID: task.taskId,
      Title: task.title,
      Description: task.description || '',
      CompletionDate: task.completionDate?.toLocaleString() || 'N/A',
      CompletionLocation: task.completionLocation
        ? `Lat: ${task.completionLocation.latitude}, Lng: ${task.completionLocation.longitude}`
        : 'N/A',
      Notes: task.notes || '',
      Address: task.address || ''
    }));

    // ✅ Create workbook
    const workbook = XLSX.utils.book_new();
    const loginSheet = XLSX.utils.json_to_sheet(sessionSheetData);
    const taskSheet = XLSX.utils.json_to_sheet(taskSheetData);

    XLSX.utils.book_append_sheet(workbook, loginSheet, 'LoginSessions');
    XLSX.utils.book_append_sheet(workbook, taskSheet, 'CompletedTasks');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // ✅ Clean name for filename
    const safeName = employee.Name?.replace(/[^a-z0-9]/gi, '_') || 'employee';

    res.setHeader('Content-Disposition', `attachment; filename=${safeName}_work_sessions.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (err) {
    console.error('Error generating work sessions file:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTaskCancelRequest = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Missing request ID" });
    }

    const cancelRequest = await TaskCancelRequest.findById(id);
    if (!cancelRequest) {
      return res.status(404).json({ message: "TaskCancelRequest not found" });
    }

    // Fetch task using taskId (stored as string in request)
    const task = await Task.findOne({ taskId: cancelRequest.taskId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Fetch employee using employeeId
    const employee = await Employee.findById(cancelRequest.employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Get AuthUser to fetch employee name
    const authUser = await AuthUser.findOne({
      refId: employee._id,
      roleModel: 'Employee',
    });

    const responseData = {
      _id: cancelRequest._id,
      reason: cancelRequest.reason,
      status: cancelRequest.status,
      requestedAt: cancelRequest.requestedAt,
      employee: {
        _id: employee._id,
        name: authUser?.username || 'Unknown',
      },
      task: {
        _id: task._id,
        title: task.title,
        address: task.address,
        assignDate: task.assignDate,
        startDate: task.startDate,
        dueDate: task.dueDate,
      },
    };

    return res.status(200).json(responseData);

  } catch (err) {
    console.error("Error in getTaskCancelRequest:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
