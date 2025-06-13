const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

// Login Route
router.post('/login', authController.login);
router.get('/checkuserlogin', authController.checkuserlogin);
router.post('/logout', authController.logout);
router.post('/verifypassword', authController.verifyPassword);

// Optional: Register, Logout
// router.post('/logout', authController.logout);

module.exports = router;
 