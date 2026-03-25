import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const debugUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI );
    console.log('✅ Connected to MongoDB');
    
    // Find admin user
    const admin = await User.findOne({ email: 'admin@leadcrm.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('Please run seed.js first: node seed.js');
      process.exit(0);
    }
    
    console.log('\n📋 USER DETAILS:');
    console.log('='.repeat(50));
    console.log('📧 Email:', admin.email);
    console.log('👤 Username:', admin.username);
    console.log('👤 Full Name:', admin.fullName);
    console.log('🎭 Role:', admin.role);
    console.log('📅 Created:', admin.createdAt);
    console.log('🔒 Hashed Password (first 50 chars):', admin.password?.substring(0, 50));
    console.log('🔒 Hash length:', admin.password?.length);
    console.log('🔒 Starts with $2a$:', admin.password?.startsWith('$2a$'));
    console.log('='.repeat(50));
    
    // Test multiple passwords
    const testPasswords = ['Admin@123', 'admin123', 'Admin123', 'password'];
    
    console.log('\n🔐 PASSWORD VERIFICATION TESTS:');
    console.log('='.repeat(50));
    
    for (const testPassword of testPasswords) {
      const isValid = await bcrypt.compare(testPassword, admin.password);
      console.log(`Password "${testPassword}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
    
    // If no password matches, let's reset it
    if (!(await bcrypt.compare('Admin@123', admin.password))) {
      console.log('\n⚠️  Password doesn\'t match. Resetting admin password...');
      
      // Re-hash the password
      const salt = await bcrypt.genSalt(10);
      const newHashedPassword = await bcrypt.hash('Admin@123', salt);
      
      console.log('New hash generated:', newHashedPassword);
      
      // Update admin password
      admin.password = newHashedPassword;
      await admin.save();
      
      // Verify new password
      const verifyNew = await bcrypt.compare('Admin@123', admin.password);
      
      if (verifyNew) {
        console.log('✅ Admin password has been reset successfully!');
        console.log('📧 Email: admin@leadcrm.com');
        console.log('🔑 Password: Admin@123');
      } else {
        console.log('❌ Failed to reset password. Please check your User model.');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugUser();