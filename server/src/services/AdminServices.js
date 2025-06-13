const AuthUser = require('../models/AuthUserModel');
const Admin = require('../models/AdminModel');
const bcrypt = require('bcrypt');

// Function to create default admin

async function createDefaultAdmin() {
  try {
    const username = process.env.ADMIN_USERNAME 
    const password = process.env.ADMIN_PASSWORD 

    // Check if default admin AuthUser exists
    const existingAdmin = await AuthUser.findOne({ username, role: 'admin' });
    if (existingAdmin) {
      console.log('Default admin user already exists');
      return;
    }

    // Create admin-specific data
    const adminData = new Admin({
      name: 'Default Admin',
      accessLevel: 'super',
      permissions: ['all'],
    });
    const savedAdmin = await adminData.save();

    // Hash password from env var
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create AuthUser linked to Admin
    const authUser = new AuthUser({
      username,
      password: hashedPassword,
      role: 'admin',
      refId: savedAdmin._id,
      roleModel: 'Admin',
    });

    await authUser.save();
    console.log('Default admin user created');
  } catch (err) {
    console.error('Error creating default admin:', err);
  }
}

module.exports = createDefaultAdmin;