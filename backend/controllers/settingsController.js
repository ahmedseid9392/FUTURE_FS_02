import User from '../models/User.js';

// Get user settings (profile already has user-specific data)
export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user settings (profile-specific)
export const updateSettings = async (req, res) => {
  try {
    const { fullName, username, email, bio, company, position, phone, timezone, language } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, username, email, bio, company, position, phone, timezone, language },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};