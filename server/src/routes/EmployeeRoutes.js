const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/EmployeeController')

router.post('/login', employeeController.login);
router.post('/logout', employeeController.logout);
router.post('/fieldactive', employeeController.checkFieldActive);
router.get('/dashboard', employeeController.getDashboardData);
router.get('/todaylogin', employeeController.getTodayLoginSession);

router.post('/livelocation', employeeController.saveLiveLocation);


router.get('/products', employeeController.getProducts);

router.post('/task/add', employeeController.addTask);
router.post('/task/cancel', employeeController.cancelTaskRequest);
router.get('/task/cancelrequests', employeeController.getTaskCancelrequests);
router.get('/task/today', employeeController.getTodayTasks);
router.get('/task/pending', employeeController.getPendingTasks);
router.post('/task/update-status', employeeController.updateTasksStatus);
router.get('/task/month', employeeController.getTaskByMonth);

router.get('/work/month', employeeController.getEmployeeWorkByMonth);
router.get('/work/day', employeeController.getEmployeeWorkByDay);

router.post('/leaverequest', employeeController.saveEmployeeLeaveRequest);
router.get('/leaverequest', employeeController.getEmployeeLeaveRequest);


router.get('/distributors', employeeController.getDistributors);
router.get('/orders', employeeController.getOrders);
router.get('/profile', employeeController.getprofile);
router.post('/profile/update', employeeController.updateProfile);

module.exports = router;
 