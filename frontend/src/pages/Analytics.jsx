import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowUp,
  ArrowDown,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  MessageSquare,
  Download
} from "lucide-react";

const Analytics = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await API.get("/leads");
      setLeads(res.data);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredLeads = () => {
    const now = new Date();
    return leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      switch(timeRange) {
        case "week": return leadDate >= new Date(now.setDate(now.getDate() - 7));
        case "month": return leadDate >= new Date(now.setMonth(now.getMonth() - 1));
        case "year": return leadDate >= new Date(now.setFullYear(now.getFullYear() - 1));
        default: return true;
      }
    });
  };

  const filteredLeads = getFilteredLeads();
  
  const metrics = {
    total: filteredLeads.length,
    new: filteredLeads.filter(l => l.status === "new").length,
    contacted: filteredLeads.filter(l => l.status === "contacted").length,
    converted: filteredLeads.filter(l => l.status === "converted").length,
    conversionRate: filteredLeads.length ? ((filteredLeads.filter(l => l.status === "converted").length / filteredLeads.length) * 100).toFixed(1) : 0
  };

  const getWeeklyData = () => {
    const weeklyData = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const count = filteredLeads.filter(lead => new Date(lead.createdAt).toDateString() === date.toDateString()).length;
      weeklyData.push({ day: days[date.getDay()], count });
    }
    return weeklyData;
  };

  const getSourceDistribution = () => {
    const sources = {};
    filteredLeads.forEach(lead => {
      const source = lead.source || "Direct";
      sources[source] = (sources[source] || 0) + 1;
    });
    return Object.entries(sources).map(([name, value]) => ({ name, value }));
  };

  const weeklyData = getWeeklyData();
  const sourceDistribution = getSourceDistribution();
  const maxCount = Math.max(...weeklyData.map(d => d.count), 1);

  const exportAnalytics = () => {
    const data = { metrics, sourceDistribution, weeklyData, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your lead performance and conversion metrics</p>
          </div>
          <button 
            onClick={exportAnalytics} 
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {["week", "month", "year", "all"].map((range) => (
                <button 
                  key={range} 
                  onClick={() => setTimeRange(range)} 
                  className={`px-4 py-2 rounded-lg capitalize transition ${
                    timeRange === range 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {range === "all" ? "All Time" : range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Leads</p>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{metrics.total}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{metrics.conversionRate}%</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Leads</p>
                  <Activity className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{metrics.new + metrics.contacted}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Converted</p>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{metrics.converted}</p>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Weekly Trend Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Trend</h2>
                <div className="h-64 flex items-end space-x-2">
                  {weeklyData.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-lg relative group">
                        <div 
                          className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
                          style={{ height: `${(day.count / maxCount) * 200}px` }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                            {day.count} leads
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{day.day}</p>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{day.count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lead Sources</h2>
                <div className="space-y-4">
                  {sourceDistribution.map((source, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{source.name}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{source.value}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                          style={{ width: `${(source.value / metrics.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Insights Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Top Source</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{sourceDistribution[0]?.name || "N/A"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sourceDistribution[0]?.value || 0} leads</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Best Day</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {weeklyData.reduce((max, day) => day.count > max.count ? day : max, { day: "N/A", count: 0 }).day}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">highest leads</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Conversion Rate</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{metrics.conversionRate}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metrics.converted} converted leads</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;