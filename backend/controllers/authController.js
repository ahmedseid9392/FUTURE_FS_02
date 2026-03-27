import User from "../models/User.js";
import PasswordReset from '../models/PasswordReset.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";



const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register User
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user with hashed password
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword
    });
    
    await user.save();
    
    const token = generateToken(user);
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    const token = generateToken(user);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Current User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal that user doesn't exist for security
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a password reset link.' 
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Save to database
    await PasswordReset.create({
      email: user.email,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    });
    
    // Send email
    await sendPasswordResetEmail(user.email, resetToken, user.fullName || user.username);
    
    res.status(200).json({ 
      message: 'If your email is registered, you will receive a password reset link.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify Reset Token
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const resetRequest = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
      used: false
    });
    
    if (!resetRequest) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    res.status(200).json({ 
      message: 'Token is valid',
      email: resetRequest.email
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const resetRequest = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
      used: false
    });
    
    if (!resetRequest) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Find user
    const user = await User.findOne({ email: resetRequest.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // IMPORTANT: Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    
    await user.save();
    
    // Mark token as used
    resetRequest.used = true;
    await resetRequest.save();
    
    res.status(200).json({ 
      message: 'Password reset successfully. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};