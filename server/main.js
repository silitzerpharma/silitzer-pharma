require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http'); // For socket server
const cors = require('cors');
const cookieParser = require('cookie-parser');
const socketIO = require('socket.io');
const connectDB = require("./src/config/DbConnections");
const createDefaultAdmin = require('./src/services/AdminServices');


const AuthMiddleware = require('./src/middlewares/AuthMiddleware');

// Create HTTP server and attach Express
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  }
});


// Middleware
app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true,limit: '10mb' }));
app.use(cookieParser());

// Connect DB and setup default admin
connectDB();
createDefaultAdmin();

// CORS setup
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Trust proxy (e.g., if deployed behind Nginx)
app.set('trust proxy', true);

// Make io accessible globally (optional)
app.set('io', io);

// Routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/AdminRoutes');
const distributorRoutes = require('./src/routes/DistributorRoutes');
const employeeRoutes = require('./src/routes/EmployeeRoutes');

app.use('/auth', authRoutes);
app.use('/admin',AuthMiddleware.protectAdmin, adminRoutes);
app.use('/distributor',AuthMiddleware.protectDistributor, distributorRoutes);
app.use('/employee',AuthMiddleware.protectEmployee , employeeRoutes);

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running with Socket.IO on port ${port}`);
});
