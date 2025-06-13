const Task = require('../models/employee/TaskModel');  
const TaskCancelRequest = require('../models/employee/TaskCancelRequest');

exports.getNextTaskId = async () => {
  try {
    const lastTask = await Task.findOne()
      .sort({ _id: -1 })
      .select('taskId')
      .exec();

    const lastNumber = lastTask && lastTask.taskId
      ? parseInt(lastTask.taskId.replace('TASK-', ''), 10)
      : 1000;

    return `TASK-${lastNumber + 1}`;
  } catch (error) {
    console.error('Error generating next Task ID:', error);
    throw error;
  }
};



exports.getNextTaskCancelRequestId = async () => {
  try {
    const lastRequest = await TaskCancelRequest.findOne()
      .sort({ _id: -1 })
      .select('requestId')
      .exec();

    const lastNumber = lastRequest && lastRequest.requestId
      ? parseInt(lastRequest.requestId.replace('REQ-', ''), 10)
      : 1000;

    return `REQ-${lastNumber + 1}`;
  } catch (error) {
    console.error('Error generating next Request ID:', error);
    throw error;
  }
};
