//1. 🔐 AuthUser – shared for login
// models/AuthUser.js
const mongoose = require('mongoose');

const authUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ['admin', 'employee', 'distributor'],
    required: true,
  },

  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'roleModel', // Dynamic reference
  },

  roleModel: {
    type: String,
    required: true,
    enum: ['Admin', 'Employee', 'Distributor'],
  },
}, { timestamps: true });

module.exports = mongoose.model('AuthUser', authUserSchema);


//2. 👨‍💼 Admin.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: String,
  accessLevel: String,
  permissions: [String],
  // more fields...
});

module.exports = mongoose.model('Admin', adminSchema);

//3. 👷 Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  fullName: String,
  employeeId: String,
  department: String,
  shift: String,
  // more fields...
});

module.exports = mongoose.model('Employee', employeeSchema);

//4. 🚚 Distributor.js
const mongoose = require('mongoose');

const distributorSchema = new mongoose.Schema({
  companyName: String,
  gstNumber: String,
  licenseNumber: String,
  region: String,
  // more fields...
});

module.exports = mongoose.model('Distributor', distributorSchema);


// Example: Create a New Distributor
const Distributor = require('./models/Distributor');
const AuthUser = require('./models/AuthUser');
const bcrypt = require('bcrypt');

const distributor = await Distributor.create({
  companyName: 'Pharma Ltd',
  gstNumber: 'GST123',
  licenseNumber: 'LIC789',
  region: 'North',
});

const hashedPassword = await bcrypt.hash('distributor123', 10);

await AuthUser.create({
  email: 'distributor@pharma.com',
  password: hashedPassword,
  role: 'distributor',
  refId: distributor._id,
  roleModel: 'Distributor',
});

