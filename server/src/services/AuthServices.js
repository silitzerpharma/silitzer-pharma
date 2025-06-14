const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthUser = require('../models/AuthUserModel');


exports.hashPassword = async (password) => {
    try {
        const hash = await bcrypt.hash(password, 10);
        return hash;
    } catch (error) {
        throw new Error('Failed to hash password');
    }
};

exports.checkPassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

exports.getTokenByUserId = (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const payload = { userId };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '12h',
    issuer: 'Silitzer-Pharma',
  });

  return token;
};

exports.getUserIDByToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], 
      issuer: 'Silitzer-Pharma', 
    });

    return decoded.userId;
  } catch (err) {
    console.error("Invalid token:", err.message);
    return null;
  }
};

exports.getUserById = async (user_id) => {
  try {
    const user = await AuthUser.findById(user_id);
    return user || null; // Return null if user not found
  } catch (err) {
    console.error('Error fetching user by ID:', err); // Optional: log error
    return null;
  }
};

exports.checkUsernamePresent = async (username) => {
  try {
    const user = await AuthUser.findOne({ username }); // corrected method
    return !!user; // returns true if user exists, false otherwise
  } catch (err) {
    console.error('Error checking username:', err);
    throw err; // rethrow so calling code can handle it
  }
};

