const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "https://flourishing-faun-86c068.netlify.app"
    ],
    credentials: true
  })
);

// Body parser middleware (allows Express to read JSON data)
app.use(express.json());

// Base Route
app.get('/api/v1', (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome to the FinTrack API' });
});

// Import Routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const analyticsRoutes = require('./routes/analytics');
const friendRoutes = require('./routes/friends');
const settingsRoutes = require('./routes/settings');

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/friends', friendRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Global Error Handler (Must be placed AFTER all routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`FinTrack Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections (e.g., if MongoDB fails to connect)
process.on('unhandledRejection', (err, promise) => {
  console.log(`Critical Error: ${err.message}`);
  server.close(() => process.exit(1));
});