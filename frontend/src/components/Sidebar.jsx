import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle,
  TrendingUp,
  MessageSquare,
  LogOut,
  Calendar,
  FileText
} from "lucide-react";

const Sidebar = ({ isCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const mainMenuItems = [
    { path: "/dashboard", name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: "/leads", name: "Leads", icon: <Users className="w-5 h-5" /> },
    { path: "/analytics", name: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { path: "/messages", name: "Messages", icon: <MessageSquare className="w-5 h-5" /> },
    { path: "/calendar", name: "Calendar", icon: <Calendar className="w-5 h-5" /> },
    { path: "/reports", name: "Reports", icon: <FileText className="w-5 h-5" /> },
  ];

  const secondaryMenuItems = [
    { path: "/settings", name: "Settings", icon: <Settings className="w-5 h-5" /> },
    { path: "/help", name: "Help & Support", icon: <HelpCircle className="w-5 h-5" /> },
  ];

  return (
    <div className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col h-full transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      
      {/* Logo Section */}
      <div className={`p-6 border-b border-gray-700 ${isCollapsed ? 'px-2' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'}`}>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          {!isCollapsed && (
            <>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                LeadCRM
              </h2>
            </>
          )}
        </div>
        {!isCollapsed && (
          <p className="text-xs text-gray-400 mt-2">Client Management System</p>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <div className="space-y-1">
          {mainMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              title={isCollapsed ? item.name : ""}
            >
              {item.icon}
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
              
              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Stats Summary - Only show when not collapsed */}
        {!isCollapsed && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">Today's Leads</span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-xs text-gray-400 mt-1">+20% from yesterday</div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className={`px-3 py-6 border-t border-gray-700 ${isCollapsed ? 'px-2' : ''}`}>
        {secondaryMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-lg transition-all duration-200 group relative ${
              isActive(item.path)
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
            title={isCollapsed ? item.name : ""}
          >
            {item.icon}
            {!isCollapsed && <span className="font-medium">{item.name}</span>}
            
            {/* Tooltip for collapsed mode */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </Link>
        ))}
        
        {/* Logout Button */}
        <button
          onClick={logout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200 mt-2 group relative`}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
          
          {/* Tooltip for collapsed mode */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;