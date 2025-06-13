// services/EmployeeServices.js
const mongoose = require('mongoose');

const Employee = require('../models/EmployeeModel');
const AuthUser = require('../models/AuthUserModel');
const AuthServices = require('../services/AuthServices')
const LeaveRequest = require('../models/employee/LeaveRequestModel');
const TaskCancelRequest = require('../models/employee/TaskCancelRequest');
const Task = require('../models/employee/TaskModel');

exports.getNextEmployeeId = async () => {
  try {
    const lastEmployee = await Employee.findOne()
      .sort({ _id: -1 })
      .select('EmployeeID')
      .exec();

    const lastNumber = lastEmployee && lastEmployee.EmployeeID
      ? parseInt(lastEmployee.EmployeeID.replace('EMP-', ''), 10)
      : 100;

    return `EMP-${lastNumber + 1}`;
  } catch (error) {
    console.error('Error generating next Employee ID:', error);
    throw error;
  }
};

exports.getEmployeeByReq = async (req) => {
 try {
    const token = req.cookies.token;
    const ip = req.ip;
    const userId = AuthServices.getUserIDByToken(token, ip);
    if (!userId) {
      return null
    }
    const authUser = await AuthUser.findById(userId);
    if (!authUser || authUser.role !== 'employee' || authUser.roleModel !== 'Employee') {
      return null
    }
    const employeeId = authUser.refId;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return null
    }
    return employee
  }catch(err){
      return null
  }

};

exports.getNextLeaveRequestId = async () => {
  try {
    const lastRequest = await LeaveRequest.findOne()
      .sort({ _id: -1 })
      .select('requestId')
      .exec();

    const lastNumber = lastRequest && lastRequest.requestId
      ? parseInt(lastRequest.requestId.replace('LR-', ''), 10)
      : 100;

    return `LR-${lastNumber + 1}`;
  } catch (error) {
    console.error('Error generating next Leave Request ID:', error);
    throw error;
  }
};

exports.getRequestCount = async (employeeId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new Error("Invalid employeeId");
    }

    const leaveCountPromise = LeaveRequest.countDocuments({
      employeeId: employeeId,
      status: 'Pending',
      isDeleted: false,
    });

    const taskCancelCountPromise = TaskCancelRequest.countDocuments({
      employeeId: employeeId,
      status: 'Pending',
    });

    const [leaveCount, cancelCount] = await Promise.all([
      leaveCountPromise,
      taskCancelCountPromise,
    ]);

    return leaveCount + cancelCount;
  } catch (err) {
    console.error("Error in getRequestCount:", err);
    throw err;
  }
};

exports.getLeaves = async (employeeId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new Error("Invalid employeeId");
    }

    const approvedLeaves = await LeaveRequest.find({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      status: "Approved",
      isDeleted: false,
    });

    const leaves = {
      casual: 0,
      sick: 0,
      unpaid: 0,
      earned: 0,
      total: 0,
    };

    approvedLeaves.forEach(leave => {
      const type = leave.leaveType.toLowerCase(); // e.g. "casual"
      const dayCount = Math.floor(
        (new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24) + 1
      );

      if (leaves.hasOwnProperty(type)) {
        leaves[type] += dayCount;
        leaves.total += dayCount;
      }
    });

    return leaves;

  } catch (err) {
    console.error("Error in getLeaves:", err);
    return {
      casual: 0,
      sick: 0,
      unpaid: 0,
      earned: 0,
      total: 0,
    };
  }
};

exports.getCurrentTask = async (employeeId) => {
  try {
    if (!employeeId) {
      throw new Error("employeeId is required");
    }

    const task = await Task.findOne({
      assignedTo: employeeId,
      status: 'Ongoing',
    })
    .sort({ createdAt: -1 }); // Get the latest ongoing task

    return task;
  } catch (error) {
    console.error('Error fetching current task:', error);
    throw error;
  }
};

exports.updateEmployeeDataSocket = (req)=>{
    try {
      const io = req.app.get('io');
      io.emit('updateEmployeeData');
    } catch (socketError) {
      console.warn('Socket emit failed:', socketError.message);
    }
}