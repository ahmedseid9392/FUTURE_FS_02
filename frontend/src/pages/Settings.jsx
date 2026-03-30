import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useDarkMode } from "../context/DarkModeContext";
import Layout from "../components/Layout";
import API from "../services/api";
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  Sun, 
  Mail, 
  Lock, 
  Save, 
  X,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Trash2,
  Database,
  RefreshCw,
  Download,
  Upload,
  Key,
  Smartphone,
  CreditCard,
  Languages,
  Palette,
  Volume2,
  Monitor,
  Tablet,
  Smartphone as MobileIcon,
  Plus,
  Minus
} from "lucide-react";

const Settings = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile Settings
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    company: "",
    position: "",
    phone: "",
    timezone: "UTC",
    language: "en"
  });
  
  // Password Settings
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    leadAlerts: true,
    messageAlerts: true,
    weeklyReport: false,
    marketingEmails: false,
    desktopNotifications: true,
    soundAlerts: false
  });
  
  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: isDarkMode ? "dark" : "light",
    fontSize: "medium",
    compactView: false,
    animations: true,
    sidebarCollapsed: false
  });
  
  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true,
    deviceManagement: false
  });
  
  // Data Settings
  const [dataSettings, setDataSettings] = useState({
    autoBackup: false,
    backupFrequency: "weekly",
    exportFormat: "json"
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        company: user.company || "",
        position: user.position || "",
        phone: user.phone || "",
        timezone: user.timezone || "UTC",
        language: user.language || "en"
      });
    }
  }, [user]);

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const res = await API.put("/auth/profile", profileForm);
      await updateProfile(profileForm);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to update profile");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage("New passwords do not match");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      await API.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      setSuccessMessage("Password changed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to change password");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // Save Notification Settings
  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await API.put("/settings/notifications", notificationSettings);
      setSuccessMessage("Notification settings saved!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to save settings");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // Save Appearance Settings
  const handleSaveAppearance = async () => {
    if (appearanceSettings.theme === "dark" && !isDarkMode) {
      toggleDarkMode();
    } else if (appearanceSettings.theme === "light" && isDarkMode) {
      toggleDarkMode();
    }
    
    setSuccessMessage("Appearance settings saved!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };
  
  // Export Data
  const exportData = async () => {
    try {
      const res = await API.get("/export/data");
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `crm_export_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccessMessage("Data exported successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to export data");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };
  
  // Delete Account
  const deleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️ WARNING: This action is permanent!\n\n" +
      "Deleting your account will:\n" +
      "- Remove all your leads\n" +
      "- Delete all conversations\n" +
      "- Remove all your data\n\n" +
      "This action cannot be undone. Are you absolutely sure?"
    );
    
    if (!confirmed) return;
    
    const confirmText = prompt("Type 'DELETE' to confirm account deletion:");
    if (confirmText !== "DELETE") {
      alert("Account deletion cancelled. You must type 'DELETE' to confirm.");
      return;
    }
    
    setLoading(true);
    try {
      await API.delete("/auth/account");
      logout();
    } catch (error) {
      setErrorMessage("Failed to delete account");
      setTimeout(() => setErrorMessage(""), 3000);
      setLoading(false);
    }
  };
  
  const tabs = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="w-4 h-4" /> },
    { id: "data", label: "Data", icon: <Database className="w-4 h-4" /> }
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account preferences and system settings
          </p>
        </div>
        
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-700 dark:text-green-400">{successMessage}</p>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 dark:text-red-400">{errorMessage}</p>
          </div>
        )}
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="max-w-4xl">
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your personal information</p>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={profileForm.company}
                      onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Your company name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Position / Role
                    </label>
                    <input
                      type="text"
                      value={profileForm.position}
                      onChange={(e) => setProfileForm({ ...profileForm, position: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Sales Manager"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={profileForm.timezone}
                      onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Central European Time (CET)</option>
                      <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                      <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                      <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={profileForm.language}
                      onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ja">Japanese</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your password to keep your account secure</p>
                </div>
                
                <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      <Key className="w-4 h-4" />
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Two-Factor Authentication */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Two-Factor Authentication
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Enable 2FA</p>
                      <p className="text-sm text-gray-500">Protect your account with two-factor authentication</p>
                    </div>
                    <button
                      onClick={() => setSecuritySettings({ ...securitySettings, twoFactorAuth: !securitySettings.twoFactorAuth })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        securitySettings.twoFactorAuth ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          securitySettings.twoFactorAuth ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Session Management */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Session Management</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Control your active sessions and timeout settings</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                      min="5"
                      max="120"
                      step="5"
                      className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Login Alerts</p>
                      <p className="text-sm text-gray-500">Receive email alerts for new login attempts</p>
                    </div>
                    <button
                      onClick={() => setSecuritySettings({ ...securitySettings, loginAlerts: !securitySettings.loginAlerts })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        securitySettings.loginAlerts ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          securitySettings.loginAlerts ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  
                  <button className="mt-4 text-sm text-blue-600 hover:text-blue-700">
                    View Active Sessions
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose how you want to be notified</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, emailNotifications: !notificationSettings.emailNotifications })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      notificationSettings.emailNotifications ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notificationSettings.emailNotifications ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                    <p className="text-sm text-gray-500">Receive browser push notifications</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, pushNotifications: !notificationSettings.pushNotifications })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      notificationSettings.pushNotifications ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notificationSettings.pushNotifications ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Lead Alerts</p>
                    <p className="text-sm text-gray-500">Get notified when new leads are added</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, leadAlerts: !notificationSettings.leadAlerts })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      notificationSettings.leadAlerts ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notificationSettings.leadAlerts ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Message Alerts</p>
                    <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, messageAlerts: !notificationSettings.messageAlerts })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      notificationSettings.messageAlerts ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notificationSettings.messageAlerts ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Weekly Report</p>
                    <p className="text-sm text-gray-500">Receive weekly performance reports</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, weeklyReport: !notificationSettings.weeklyReport })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      notificationSettings.weeklyReport ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notificationSettings.weeklyReport ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Appearance Settings */}
          {activeTab === "appearance" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customize how the application looks</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: "light" })}
                      className={`p-4 border-2 rounded-lg text-center transition ${
                        appearanceSettings.theme === "light"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                      <span className="text-sm">Light</span>
                    </button>
                    
                    <button
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: "dark" })}
                      className={`p-4 border-2 rounded-lg text-center transition ${
                        appearanceSettings.theme === "dark"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Moon className="w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                      <span className="text-sm">Dark</span>
                    </button>
                    
                    <button
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: "system" })}
                      className={`p-4 border-2 rounded-lg text-center transition ${
                        appearanceSettings.theme === "system"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                      <span className="text-sm">System</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Font Size
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, fontSize: "small" })}
                      className={`px-4 py-2 rounded-lg border transition ${
                        appearanceSettings.fontSize === "small"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Small
                    </button>
                    <button
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, fontSize: "medium" })}
                      className={`px-4 py-2 rounded-lg border transition ${
                        appearanceSettings.fontSize === "medium"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, fontSize: "large" })}
                      className={`px-4 py-2 rounded-lg border transition ${
                        appearanceSettings.fontSize === "large"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Large
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Compact View</p>
                    <p className="text-sm text-gray-500">Reduce spacing and show more content</p>
                  </div>
                  <button
                    onClick={() => setAppearanceSettings({ ...appearanceSettings, compactView: !appearanceSettings.compactView })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      appearanceSettings.compactView ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      appearanceSettings.compactView ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Animations</p>
                    <p className="text-sm text-gray-500">Enable smooth transitions and animations</p>
                  </div>
                  <button
                    onClick={() => setAppearanceSettings({ ...appearanceSettings, animations: !appearanceSettings.animations })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      appearanceSettings.animations ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      appearanceSettings.animations ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={handleSaveAppearance}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Save className="w-4 h-4" />
                    Apply Changes
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Data Settings */}
          {activeTab === "data" && (
            <div className="space-y-6">
              {/* Export Data */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Export Data</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Export your data for backup or migration</p>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Export All Data</p>
                      <p className="text-sm text-gray-500">Download all your leads, messages, and settings</p>
                    </div>
                    <button
                      onClick={exportData}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Import Data */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Import Data</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Import leads from CSV or JSON files</p>
                </div>
                
                <div className="p-6">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">CSV or JSON files only</p>
                    </div>
                    <input type="file" className="hidden" accept=".csv,.json" />
                  </label>
                </div>
              </div>
              
              {/* Danger Zone */}
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
                <div className="px-6 py-4 border-b border-red-200 dark:border-red-800">
                  <h2 className="text-lg font-semibold text-red-800 dark:text-red-400">Danger Zone</h2>
                  <p className="text-sm text-red-600 dark:text-red-500">Permanent actions that cannot be undone</p>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-400">Delete Account</p>
                      <p className="text-sm text-red-600 dark:text-red-500">Permanently delete your account and all data</p>
                    </div>
                    <button
                      onClick={deleteAccount}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;