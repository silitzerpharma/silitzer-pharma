const AuthUser = require('../models/AuthUserModel');
const AuthServices = require('../services/AuthServices.js');

exports.protectAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = AuthServices.getUserIDByToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await AuthUser.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    // Optionally, attach user to req for downstream use
    req.user = user;

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({ message: 'Server error during admin auth' });
  }

};


exports.protectEmployee = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = AuthServices.getUserIDByToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await AuthUser.findById(userId);
    if (!user || user.role !== 'employee') {
      return res.status(403).json({ message: 'Access denied: Employees only' });
    }

    req.user = user; 

    next();
  } catch (error) {
    console.error('Employee auth error:', error);
    return res.status(500).json({ message: 'Server error during employee auth' });
  }
};

exports.protectDistributor = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = AuthServices.getUserIDByToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await AuthUser.findById(userId);
    if (!user || user.role !== 'distributor') {
      return res.status(403).json({ message: 'Access denied: Distributors only' });
    }

    req.user = user; // Attach distributor user info to request if needed
    next();
  } catch (error) {
    console.error('Distributor auth error:', error);
    return res.status(500).json({ message: 'Server error during distributor auth' });
  }
};