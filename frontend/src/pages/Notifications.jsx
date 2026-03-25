import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import API from "../services/api";
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Users, 
  Mail,
  Calendar,
  Clock,
  UserPlus,
  TrendingUp,
  Check,
  Eye,
  Trash2,
  Filter,
  Download,
  Settings
} from "lucide-react";

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [notificationType, setNotificationType] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await API.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await API.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Delete selected notifications
  const deleteSelected = async () => {
    try {
      await Promise.all(
        selectedNotifications.map(id => API.delete(`/notifications/${id}`))
      );
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n._id)));
      setSelectedNotifications([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Failed to delete notifications:", error);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
    setSelectAll(!selectAll);
  };

  // Handle single select
  const handleSelect = (id) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(prev => prev.filter(n => n !== id));
    } else {
      setSelectedNotifications(prev => [...prev, id]);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch(type) {
      case "lead":
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case "message":
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case "calendar":
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case "email":
        return <Mail className="w-5 h-5 text-yellow-500" />;
      case "conversion":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get notification background
  const getNotificationBg = (type, read) => {
    if (read) return "bg-white dark:bg-gray-800";
    switch(type) {
      case "lead":
        return "bg-blue-50 dark:bg-blue-900/20";
      case "message":
        return "bg-green-50 dark:bg-green-900/20";
      case "calendar":
        return "bg-purple-50 dark:bg-purple-900/20";
      case "email":
        return "bg-yellow-50 dark:bg-yellow-900/20";
      default:
        return "bg-gray-50 dark:bg-gray-800";
    }
  };

  // Format time
  const formatTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now - notificationDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return notificationDate.toLocaleDateString();
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread" && notification.read) return false;
    if (filter === "read" && !notification.read) return false;
    if (notificationType !== "all" && notification.type !== notificationType) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Stay updated with your latest activities and alerts
            </p>
          </div>
          <div className="flex gap-2">
            {selectedNotifications.length > 0 && (
              <button
                onClick={deleteSelected}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedNotifications.length})
              </button>
            )}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <Check className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  filter === "unread"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  filter === "read"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                Read ({notifications.length - unreadCount})
              </button>
            </div>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="lead">Leads</option>
              <option value="message">Messages</option>
              <option value="email">Emails</option>
              <option value="calendar">Calendar</option>
              <option value="conversion">Conversions</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
              <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            <>
              {/* Select All Header */}
              {filteredNotifications.length > 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Select all ({filteredNotifications.length})
                    </span>
                  </label>
                </div>
              )}

              {/* Notifications */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 transition ${getNotificationBg(notification.type, notification.read)}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={() => handleSelect(notification._id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {
                        if (!notification.read) markAsRead(notification._id);
                        // Navigate logic here
                      }}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`text-sm ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification._id);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;