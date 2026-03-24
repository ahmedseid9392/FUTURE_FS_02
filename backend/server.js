// backend/server.js
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import leadRoutes from "./routes/leadRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import  profileRoutes from './routes/profileRoutes.js';




dotenv.config();

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const PORT=process.env.PORT;
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', profileRoutes); // Profile routes under /api/auth
app.use('/api/leads', leadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Max 5MB' });
    }
  }
  
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});