import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import routes
import authRoutes from '../../routes/authRoutes.js';
import leadRoutes from '../../routes/leadRoutes.js';
import messageRoutes from '../../routes/messageRoutes.js';
import calendarRoutes from '../../routes/calendarRoutes.js';
import reportRoutes from '../../routes/reportRoutes.js';
import notificationRoutes from '../../routes/notificationRoutes.js';
import profileRoutes from '../../routes/profileRoutes.js';
import exportRoutes from '../../routes/exportRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (lazy connection)
let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedDb) {
    return cachedDb;
  }
  
  const db = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  cachedDb = db;
  return db;
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', profileRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Export for Netlify Functions
export const handler = serverless(app);