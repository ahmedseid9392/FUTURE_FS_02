import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId, email_verified } = payload;
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      // User exists, update Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.isEmailVerified = email_verified;
        user.avatar = picture || user.avatar;
        await user.save();
      }
    } else {
      // Create new user with Google
      user = new User({
        username: email.split('@')[0],
        email: email,
        fullName: name,
        googleId: googleId,
        authProvider: 'google',
        isEmailVerified: email_verified,
        avatar: picture,
        role: 'user'
      });
      
      await user.save();
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user);
    
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
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};