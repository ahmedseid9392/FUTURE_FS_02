import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { setupEmailReceiver } from './services/emailReceiver.js';

import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import exportRoutes from './routes/exportRoutes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Check required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('\n❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease add them to your .env file.\n');
  process.exit(1);
}

console.log('✅ Environment variables loaded');

// Connect to database
connectDB();

// Setup email receiver (if email credentials exist)
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    setupEmailReceiver();
    console.log('✅ Email receiver service started');
  } catch (error) {
    console.error('⚠️ Failed to start email receiver:', error.message);
  }
} else {
  console.log('⚠️ Email service not configured. Skipping email receiver.');
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://crm-frontend-ielm.onrender.com'
 
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
console.log('📌 Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/auth', profileRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/messages', messageRoutes); // Make sure this line exists
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/export', exportRoutes);




// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File size too large. Max 5MB' });
  }
  
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
 
});

// Add this to server.js for debugging
app.get('/api/debug/check-lead/:email', async (req, res) => {
  try {
    const lead = await Lead.findOne({ email: req.params.email });
    res.json({ 
      email: req.params.email, 
      isLead: !!lead,
      lead: lead ? { name: lead.name, email: lead.email } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
