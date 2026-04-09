import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, username, email } = req.body;
    
    const existingUser = await User.findOne({
      _id: { $ne: req.user.id },
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already taken' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, username, email },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload Avatar to Cloudinary - FIXED
export const uploadAvatar = async (req, res) => {
  try {
   
    
    if (!req.file) {
     
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
   
    
    // Check if file exists
    if (!fs.existsSync(req.file.path)) {
     
      return res.status(400).json({ message: 'File upload failed' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
     
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete old avatar from Cloudinary if exists
    if (user.avatar && user.avatar.includes('cloudinary')) {
      try {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`crm_avatars/${publicId}`);
        
      } catch (deleteError) {
        console.log('Error deleting old avatar:', deleteError.message);
      }
    }
    
    // Upload to Cloudinary
    console.log('Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'crm_avatars',
      width: 300,
      height: 300,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      fetch_format: 'auto'
    });
    
  
    
    // Update user avatar URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');
    
    // Delete local file after upload
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log('Local temp file deleted');
      }
    } catch (unlinkError) {
      console.log('Error deleting temp file:', unlinkError.message);
    }
    
    res.json({ 
      message: 'Avatar uploaded successfully',
      avatarUrl: result.secure_url,
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Upload avatar error details:', error);
    console.error('Error stack:', error.stack);
    
    // Clean up temp file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.log('Error cleaning up temp file:', unlinkError.message);
      }
    }
    
    res.status(500).json({ 
      message: 'Upload failed: ' + error.message,
      error: error.message 
    });
  }
};

// Remove Avatar from Cloudinary
export const removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.avatar && user.avatar.includes('cloudinary')) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`crm_avatars/${publicId}`);
     
    }
    
    await User.findByIdAndUpdate(req.user.id, { avatar: null });
    res.json({ message: 'Avatar removed successfully' });
    
  } catch (error) {
    console.error('Remove avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};