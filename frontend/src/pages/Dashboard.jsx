import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import Layout from "../components/Layout";
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  ArrowRight,
  Calendar,
  Activity,
  BarChart3,
  Mail,
  PieChart,
  Download
} from "lucide-react";

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    converted: 0,
    conversionRate: 0
  });

  useEffect(() => {
    fetchLeads();
  }, []);

 // In Dashboard.jsx and Analytics.jsx
// In Dashboard.jsx, add the recentLeads calculation after fetching leads
const fetchLeads = async () => {
  try {
    setLoading(true);
    const res = await API.get("/leads");
    setLeads(res.data);
    
    // Calculate stats
    const total = res.data.length;
    const newLeads = res.data.filter(l => l.status === "new").length;
    const contacted = res.data.filter(l => l.status === "contacted").length;
    const converted = res.data.filter(l => l.status === "converted").length;
    const conversionRate = total ? ((converted / total) * 100).toFixed(1) : 0;
    
    setStats({ total, new: newLeads, contacted, converted, conversionRate });
    
    // Get recent leads (last 5) - ADD THIS
    const recent = [...res.data]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    setRecentLeads(recent);
    
  } catch (error) {
    console.error("Failed to fetch leads:", error);
  } finally {
    setLoading(false);
  }
};

  const getStatusColor = (status) => {
    switch(status) {
      case "new": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "contacted": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "converted": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "new": return <Clock className="w-4 h-4" />;
      case "contacted": return <MessageSquare className="w-4 h-4" />;
      case "converted": return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const exportData = async () => {
  try {
    const res = await API.get('/export/all', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leadcrm_export_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed');
  }
};

  // Calculate weekly trend (last 7 days)
  const getWeeklyTrend = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const count = leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate.toDateString() === date.toDateString();
      }).length;
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count
      });
    }
    return last7Days;
  };

  const weeklyData = getWeeklyTrend();
  const maxCount = Math.max(...weeklyData.map(d => d.count), 1);


  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1> <button
  onClick={exportData}
  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
>
  <Download className="w-4 h-4" />
  Export Data
</button>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your leads today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-2">All time</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">New Leads</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.new}</p>
                <p className="text-xs text-gray-500 mt-2">Need attention</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Contacted</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.contacted}</p>
                <p className="text-xs text-gray-500 mt-2">In progress</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Converted</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.converted}</p>
                <p className="text-xs text-gray-500 mt-2">{stats.conversionRate}% conversion</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Lead Trend</h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-end space-x-2">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-lg transition-all duration-500"
                       style={{ height: `${(day.count / maxCount) * 200}px` }}>
                    <div className="w-full h-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg opacity-75"
                         style={{ height: `${(day.count / maxCount) * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{day.date}</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{day.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Distribution</h2>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">New Leads</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats.new}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" 
                       style={{ width: `${stats.total ? (stats.new / stats.total) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Contacted</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats.contacted}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" 
                       style={{ width: `${stats.total ? (stats.contacted / stats.total) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Converted</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats.converted}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" 
                       style={{ width: `${stats.total ? (stats.converted / stats.total) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-sm text-gray-500">Overall Conversion Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.conversionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Leads Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Leads</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest 5 leads added to your system</p>
            </div>
            <Link 
              to="/leads" 
              className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No leads yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Start by adding your first lead</p>
              <Link
                to="/leads"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Lead
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">{lead.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{lead.email}</div>
                        {lead.phone && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{lead.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{lead.source || "—"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {getStatusIcon(lead.status)}
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/leads/${lead._id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/leads"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:shadow-lg transition"
          >
            <Users className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Manage Leads</h3>
            <p className="text-sm opacity-90">View and manage all your leads</p>
          </Link>
          
          <Link
            to="/analytics"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:shadow-lg transition"
          >
            <BarChart3 className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-1">View Analytics</h3>
            <p className="text-sm opacity-90">Detailed insights and reports</p>
          </Link>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 hover:shadow-lg transition cursor-pointer">
            <Mail className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Email Campaign</h3>
            <p className="text-sm opacity-90">Send follow-up emails to leads</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;