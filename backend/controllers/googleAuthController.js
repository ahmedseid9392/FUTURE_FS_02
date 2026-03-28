import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

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
    
    // Get the client ID from environment
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
      console.error('GOOGLE_CLIENT_ID is not set in environment variables');
      return res.status(500).json({ message: 'Google authentication is not configured' });
    }
    
    console.log('Verifying Google token with client ID:', googleClientId);
    
    // Create OAuth2 client with the correct client ID
    const client = new OAuth2Client(googleClientId);
    
    // Verify Google token with more detailed options
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId, // Explicitly set the audience
      // Required audience must match your client ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId, email_verified } = payload;
    
    console.log('Google user verified:', { email, name, googleId, email_verified });
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      console.log('User exists, updating Google info...');
      // User exists, update Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.isEmailVerified = email_verified;
        if (picture) user.avatar = picture;
        if (name) user.fullName = name;
        await user.save();
      }
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
        role: 'user'
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
    console.error('Google auth error details:', {
      message: error.message,
      stack: error.stack
    });
    
    // Send more detailed error response
    res.status(500).json({ 
      message: 'Google authentication failed: ' + error.message 
    });
  }
};