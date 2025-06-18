// server.js or index.js

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const socketIO = require('socket.io');

// Custom modules
const connectDB = require('./src/config/DbConnections');
const createDefaultAdmin = require('./src/services/AdminServices');
const AuthMiddleware = require('./src/middlewares/AuthMiddleware');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Trust Render proxy
app.set('trust proxy', true);

// Middleware
app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

//"https://silitzerpharma.onrender.com"
const FRONTEND_ORIGIN ="http://localhost:5173" ;

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

// Optional: Redirect HTTP to HTTPS (for Render)
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers['x-forwarded-proto'] !== 'https'
  ) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    credentials: true,
  },
});

// Save io to app context if needed elsewhere
app.set('io', io);

// ✅ Handle client socket connections
io.on('connection', (socket) => {
  console.log('✅ A client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Async startup
async function startServer() {
  try {
    await connectDB();
    await createDefaultAdmin();

    // Load routes
    const authRoutes = require('./src/routes/authRoutes');
    const adminRoutes = require('./src/routes/AdminRoutes');
    const distributorRoutes = require('./src/routes/DistributorRoutes');
    const employeeRoutes = require('./src/routes/EmployeeRoutes');

    app.use('/auth', authRoutes);
    app.use('/admin', AuthMiddleware.protectAdmin, adminRoutes);
    app.use('/distributor', AuthMiddleware.protectDistributor, distributorRoutes);
    app.use('/employee', AuthMiddleware.protectEmployee, employeeRoutes);

    // Start server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
