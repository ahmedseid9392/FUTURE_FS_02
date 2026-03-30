import { createContext, useState, useContext, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile...');
      const res = await API.get('/auth/profile');
      setUser(res.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, remember = false) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token, user } = res.data;
      
      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      setToken(token);
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const googleLogin = async (userData) => {
    try {
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      return { 
        success: false, 
        message: error.message || 'Google login failed' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await API.post('/auth/register', { username, email, password });
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await API.put('/auth/profile', profileData);
      setUser(res.data);
      return { success: true, data: res.data };
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Update failed' 
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await API.put('/auth/change-password', { currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password change failed' 
      };
    }
  };

  // ADD THESE FUNCTIONS - Avatar upload and remove
  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const res = await API.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUser(res.data.user);
      return { success: true, avatarUrl: res.data.avatarUrl };
    } catch (error) {
      console.error('Upload avatar error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Upload failed' 
      };
    }
  };

  const removeAvatar = async () => {
    try {
      await API.delete('/auth/avatar');
      setUser({ ...user, avatar: null });
      return { success: true };
    } catch (error) {
      console.error('Remove avatar error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Remove failed' 
      };
    }
  };

  const value = {
    user,
    loading,
    token,
    login,
    googleLogin,
    register,
    logout,
    updateProfile,
    changePassword,
    uploadAvatar,  // Add this
    removeAvatar,  // Add this
    fetchProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};