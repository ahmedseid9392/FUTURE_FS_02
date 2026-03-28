import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const debugPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_db');
    console.log('✅ Connected to MongoDB');
    
    const admin = await User.findOne({ email: 'admin@leadcrm.com' });
    
    if (!admin) {
      console.log('❌ Admin not found');
      process.exit(0);
    }
    
    console.log('\n📋 ADMIN USER DETAILS:');
    console.log('='.repeat(50));
    console.log('Email:', admin.email);
    console.log('Stored Password Hash:', admin.password);
    console.log('Hash Length:', admin.password?.length);
    console.log('Hash Starts with $2b$:', admin.password?.startsWith('$2b$'));
    console.log('='.repeat(50));
    
    // Test password verification
    const testPassword = 'Admin@123';
    const isValid = await bcrypt.compare(testPassword, admin.password);
    
    console.log('\n🔐 PASSWORD VERIFICATION TEST:');
    console.log(`Password "${testPassword}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (!isValid) {
      console.log('\n⚠️  Password is not hashed correctly. Fixing...');
      
      // Re-hash the password
      const salt = await bcrypt.genSalt(10);
      const newHashedPassword = await bcrypt.hash(testPassword, salt);
      
      admin.password = newHashedPassword;
      await admin.save();
      
      console.log('✅ Password re-hashed and saved');
      
      // Verify again
      const verifyAgain = await bcrypt.compare(testPassword, admin.password);
      console.log(`Re-verification: ${verifyAgain ? '✅ SUCCESS' : '❌ FAILED'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugPassword();