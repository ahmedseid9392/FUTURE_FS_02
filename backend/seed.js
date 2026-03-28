import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crm_db');
    console.log('✅ Connected to MongoDB');

    const plainPassword = 'Admin@123';
    
    // Hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    // Delete existing admin if exists
    await User.deleteOne({ email: 'admin@leadcrm.com' });
    
    // Create admin user with hashed password
    const admin = new User({
      username: 'admin',
      email: 'admin@leadcrm.com',
      password: hashedPassword, // Store the hashed password
      fullName: 'Admin User',
      role: 'admin',
      createdAt: new Date()
    });
    
    await admin.save();
    
    // Verify the password
    const savedAdmin = await User.findOne({ email: 'admin@leadcrm.com' });
    const isValid = await bcrypt.compare(plainPassword, savedAdmin.password);
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 ADMIN CREDENTIALS:');
    console.log('='.repeat(50));
    console.log('📧 Email: admin@leadcrm.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Name: Admin User');
    console.log('🎭 Role: Admin');
    console.log('='.repeat(50));
    
    if (isValid) {
      console.log('✅ VERIFICATION: SUCCESS - Password is properly hashed');
    } else {
      console.log('❌ VERIFICATION: FAILED - Password hash issue');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();