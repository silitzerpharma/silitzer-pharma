const AuthUser = require('../models/AuthUserModel');
const bcrypt = require('bcrypt');
const { getUserIDByToken ,getTokenByUserId ,getUserById } = require('../services/AuthServices')

exports.checkuserlogin = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(400).json({ msg: "user not login" });
  try {
    const user_id = await getUserIDByToken(token);
    const user = await getUserById(user_id);
    if (!user) { return res.status(401).json({ msg: "Invalid user or session" }); }

    return res.status(200).json({ message: 'Login successful', user: { id: user._id, role: user.role,} });
  
  
  } catch (err) {
    console.error("Error in checkuserlogin:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.login = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ msg: "Request body is missing" });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ msg: "All fields (username, password) are required" });
  }

  try {
    // Find user by username and ensure not soft deleted
    const user = await AuthUser.findOne({ username });

    if (!user || user.isDeleted || user.isBlock) {
      // User doesn't exist or is deleted or blocked
      return res.status(401).json({ message: 'Invalid credentials or user blocked/deleted' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = getTokenByUserId(user._id);

res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "None",     // Must be 'None' for cross-origin
  maxAge: 12 * 60 * 60 * 1000,
});

    // Respond with user info
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        role: user.role,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ msg: err.message });
  }
};

exports.verifyPassword =async (req, res) => {
  const { password } = req.body;
if (!password)  return res.status(401).json({ message: 'Invalid password' });
  const token = req.cookies.token;
  if (!token) return res.status(400).json({ msg: "user not login" }); 
  const user_id = await getUserIDByToken(token);
  const user = await getUserById(user_id);
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {return res.status(401).json({ message: 'Invalid credentials' }); }


  return res.json({msg:"url work"})

   

}

exports.logout = async (req,res) =>{
      try {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'None',
      secure: true, // true if using HTTPS in production
      path: '/'
    });
    return res.status(200).json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err.message);
    return res.status(500).json({ msg: 'Logout failed', error: err.message });
  }

}
