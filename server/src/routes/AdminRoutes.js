const express = require('express');
const router = express.Router();


         //Controllers
const AdminController = require('../controllers/AdminController');
const AdminStockController = require('../controllers/Admin/AdminStockController')
const AdminOrderController = require ('../controllers/Admin/AdminOrderController')
const AdminProductController = require('../controllers/Admin/AdminProductController')
const AdminSliderController = require('../controllers/Admin/AdminSliderController')
const AdminEmployeeController = require('../controllers/Admin/AdminEmployeeController')


        //admin dashboard
router.get('/getadmindashboarddata', AdminController.getAdminDashboardData);
router.get('/profile', AdminController.getAdminProfile);
router.post('/profile/update', AdminController.updateAdminProfile);
router.get('/notifications', AdminController.getAdminNotifications);
router.get('/notifications/count', AdminController.getAdminNotificationsCount);
router.post('/notifications/seen', AdminController.updateAdminNotificationsSeen);


        //distributor
router.post('/savedistributor', AdminController.saveDistributor);
router.delete('/removedistributor', AdminController.removeDistributor);
router.put('/editdistributor', AdminController.editDistributor);
router.get('/getalldistributors', AdminController.getAllDistributors);
router.get('/distributor', AdminController.getDistributorData);
router.put('/distributor/block', AdminController.blockDistributor);



       //Employee
router.post('/employee/add', AdminEmployeeController.addEmployee);   
router.get('/employee/all', AdminEmployeeController.getAllEmployees);  
router.post('/employee/data', AdminEmployeeController.getAllEmployeeData); 
router.post('/employee/update', AdminEmployeeController.updateEmployeeData);   
router.delete('/employee/delete', AdminEmployeeController.deleteEmployee);
router.post('/employee/block', AdminEmployeeController.blockEmployee);
router.post('/employee/assigntask', AdminEmployeeController.AssignTask);
router.get('/employee/tasks', AdminEmployeeController.getEmployeeTasks);
router.post('/employee/task/update', AdminEmployeeController.updateEmployeeTask);
router.delete('/employee/task/remove', AdminEmployeeController.removeEmployeeTask);
router.post('/employee/todaysactivity', AdminEmployeeController.getEmployeeTodaysActivity);
router.post('/employee/daysactivity', AdminEmployeeController.getEmployeedaysActivity);
router.get('/employee/employee-work-sessions', AdminEmployeeController.getEmployeeWorkSessions);
router.get('/employee/leaves', AdminEmployeeController.getEmployeeLeave);
router.get('/employee/requests', AdminEmployeeController.getEmployeeRequests);
router.post('/employee/taskcancelrequest/update', AdminEmployeeController.updateTaskCancelRequest);
router.post('/employee/leaverequest/update', AdminEmployeeController.updateLeaveRequest);
router.get('/employee/worksessions/download', AdminEmployeeController.downloadWorkSessions);




      //product
router.post('/product/add', AdminProductController.addProduct);
router.get('/products/check', AdminProductController.checkProduct);
router.post('/product/details', AdminProductController.getProductDetails);
router.delete('/product/remove', AdminProductController.removeProduct);
router.get('/products', AdminProductController.getAllProducts);
router.get('/product/orders', AdminProductController.getProductsOrders);
router.put('/product/update', AdminProductController.updateProduct);



       //order 
router.get('/getallorders', AdminOrderController.getAllOrders);
router.get('/getallpendingorders', AdminOrderController.getAllPendingOrders);
router.post('/getorder', AdminOrderController.getOrder);
router.post('/approveorder', AdminOrderController.approveOrder);
router.put('/updateorderstatus', AdminOrderController.updateOrderStatus);
router.put('/updateorderpaymentstatus', AdminOrderController.updateOrderPaymentStatus);
router.delete('/cancelorder',AdminOrderController.cancelOrder);
router.get('/order/records',AdminOrderController.allOrderRecords);
router.get('/order/download-records',AdminOrderController.downloadOrderRecords);
router.get('/order/today',AdminOrderController.getTodayOrders);
router.get('/order',AdminOrderController.getOrderDetails);



   //stock Controller 
router.get('/getstockdata', AdminStockController.getStockData);
router.put('/updatestockstatus', AdminStockController.updateStockStatus);
router.put('/updatestock', AdminStockController.updateStock);
router.get('/stocktransaction/instock', AdminStockController.getInStockTransactions);
router.get('/stocktransaction/outstock', AdminStockController.getOutStockTransactions);


router.get('/gettodaystocktransaction', AdminStockController.getTodayStockTransaction);
router.put('/search-stock-transactions', AdminStockController.searchStockTransactions);
 


//DistributorDashboardSettings 
router.post('/save-offer-slider', AdminSliderController.saveOfferSlider);
router.get('/get-offer-List', AdminSliderController.getOfferList);
router.delete('/remove-offer-slider/:id', AdminSliderController.removeOfferSlider);
router.put('/edit-offer-slider/:id', AdminSliderController.editOfferSlider);
router.post('/save-product-slider', AdminSliderController.saveProductSlider);
router.get('/get-product-slider', AdminSliderController.getProductSlider);
router.put('/update-product-slider/:id', AdminSliderController.updateProductSlider);
router.delete('/delete-product-slider/:id', AdminSliderController.deleteProductSlider);




module.exports = router;
 