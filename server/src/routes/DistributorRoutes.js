const express = require('express');
const router = express.Router();
const DistributorController = require('../controllers/DistributorController')

router.get('/getallproducts', DistributorController.getAllProducts);
router.post('/placeorder', DistributorController.placeOrder);
router.get('/get-all-product-list', DistributorController.getAllProductsList);
router.get('/product/:id', DistributorController.getProductById);
router.get('/products/offers', DistributorController.getProductsOffers);
router.get('/offer/products', DistributorController.getOfferproducts);

router.get('/dashboard/data', DistributorController.getDashboardData);
router.get('/getallorders', DistributorController.getAllOrders);
router.get('/profile', DistributorController.getProfile);
router.post('/saveprofile', DistributorController.saveProfile);
router.post('/savePassword', DistributorController.savePassword);
router.post('/searchProducts', DistributorController.searchProducts);

module.exports = router;