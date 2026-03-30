import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Google Login/Register
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }
    
    console.log('Verifying Google token...');
    
    // Create OAuth2 client
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId, email_verified } = payload;
    
    console.log('Google user verified:', { email, name, googleId, email_verified });
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      console.log('User exists, updating Google info...');
      
      // User exists - update Google info without requiring password
      user.googleId = googleId;
      user.authProvider = 'google';
      user.isEmailVerified = email_verified;
      if (picture) user.avatar = picture;
      if (name) user.fullName = name;
      
      // IMPORTANT: Don't modify password for Google users
      // Password field remains as is for existing local users
      
      await user.save();
      console.log('User updated successfully');
    } else {
      console.log('Creating new user with Google...');
      // Create new user with Google
      user = new User({
        username: email.split('@')[0] + Math.floor(Math.random() * 1000),
        email: email,
        fullName: name,
        googleId: googleId,
        authProvider: 'google',
        isEmailVerified: email_verified,
        avatar: picture,
        role: 'user',
        // For Google users, we don't need a password
        password: undefined
      });
      
      await user.save();
      console.log('New user created:', user._id);
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user);
    
    console.log('Google auth successful for:', email);
    
    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider
      }
    });
    
  } catch (error) {
    console.error('Google auth error details:', error);
    res.status(500).json({ message: 'Google authentication failed: ' + error.message });
  }
};