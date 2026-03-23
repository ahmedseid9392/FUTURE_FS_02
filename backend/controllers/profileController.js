import User  from '../models/User.js';
import fs from 'fs';
import  path from 'path';

// Update Profile
 export const updateProfile = async (req, res) => {
  try {
    const { fullName, username, email } = req.body;
    
    // Check if username or email already taken by another user
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
    
    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload Avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const avatarUrl = `/uploads/${req.file.filename}`;
    
    // Delete old avatar if exists
    const user = await User.findById(req.user.id);
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }
    
    // Update user avatar
 const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');
    
    res.json({ 
      message: 'Avatar uploaded successfully',
      avatarUrl,
      user: updatedUser
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove Avatar
export const removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.avatar) {
      const avatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }
    
    await User.findByIdAndUpdate(req.user.id, { avatar: null });
    res.json({ message: 'Avatar removed successfully' });
  } catch (error) {
    console.error('Remove avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

