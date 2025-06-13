const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model('Admin', adminSchema);


const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true });

// Create default admin if none exists
async function createDefaultAdmin() {
  const adminExists = await Admin.findOne({ username: 'admin' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new Admin({ username: 'admin', password: hashedPassword });
    await admin.save();
    console.log('Default admin created');
  } else {
    console.log('Admin already exists');
  }
}

// Call after DB connection is ready
mongoose.connection.once('open', async () => {
  await createDefaultAdmin();
  app.listen(3000, () => console.log('Server running on port 3000'));
});



///////////////////////////////////////////////////////////////


ADMIN_USERNAME=admin
ADMIN_PASSWORD=supersecurepassword






async function createDefaultAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'change_this';

  const adminExists = await Admin.findOne({ username: adminUsername });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await Admin.create({ username: adminUsername, password: hashedPassword });
    console.log('Default admin created');
  }
}
