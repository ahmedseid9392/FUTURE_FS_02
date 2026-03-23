import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import Layout from "../components/Layout";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowUp,
  ArrowDown,
  PieChart,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  MessageSquare,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";

const Analytics = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week"); // week, month, year, all
  const [selectedMetric, setSelectedMetric] = useState("all");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await API.get("/leads");
      setLeads(res.data);
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter leads based on time range
  const getFilteredLeads = () => {
    const now = new Date();
    const filtered = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      
      switch(timeRange) {
        case "week":
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          return leadDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          return leadDate >= monthAgo;
        case "year":
          const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
          return leadDate >= yearAgo;
        default:
          return true;
      }
    });
    return filtered;
  };

  const filteredLeads = getFilteredLeads();

  // Calculate basic metrics
  const calculateMetrics = () => {
    const total = filteredLeads.length;
    const newLeads = filteredLeads.filter(l => l.status === "new").length;
    const contacted = filteredLeads.filter(l => l.status === "contacted").length;
    const converted = filteredLeads.filter(l => l.status === "converted").length;
    const conversionRate = total ? ((converted / total) * 100).toFixed(1) : 0;
    
    return { total, newLeads, contacted, converted, conversionRate };
  };

  const metrics = calculateMetrics();

  // Calculate trends compared to previous period
  const calculateTrends = () => {
    const now = new Date();
    const currentPeriod = filteredLeads;
    
    let previousPeriod = [];
    switch(timeRange) {
      case "week":
        const twoWeeksAgo = new Date(now.setDate(now.getDate() - 14));
        const oneWeekAgo = new Date(now.setDate(now.getDate() + 7));
        previousPeriod = leads.filter(lead => {
          const leadDate = new Date(lead.createdAt);
          return leadDate >= twoWeeksAgo && leadDate < oneWeekAgo;
        });
        break;
      case "month":
        const twoMonthsAgo = new Date(now.setMonth(now.getMonth() - 2));
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() + 1));
        previousPeriod = leads.filter(lead => {
          const leadDate = new Date(lead.createdAt);
          return leadDate >= twoMonthsAgo && leadDate < oneMonthAgo;
        });
        break;
      default:
        return { trend: 0, isPositive: true };
    }
    
    const currentCount = currentPeriod.length;
    const previousCount = previousPeriod.length;
    const trend = previousCount ? ((currentCount - previousCount) / previousCount * 100).toFixed(1) : 0;
    
    return { trend, isPositive: trend >= 0 };
  };

  const trends = calculateTrends();

  // Get weekly data for chart
  const getWeeklyData = () => {
    const weeklyData = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const count = filteredLeads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate.toDateString() === date.toDateString();
      }).length;
      
      weeklyData.push({
        day: days[date.getDay()],
        date: date.toLocaleDateString(),
        count
      });
    }
    
    return weeklyData;
  };

  // Get monthly data for chart
  const getMonthlyData = () => {
    const monthlyData = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = filteredLeads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate.getMonth() === date.getMonth() && 
               leadDate.getFullYear() === date.getFullYear();
      }).length;
      
      monthlyData.push({
        month: months[date.getMonth()],
        year: date.getFullYear(),
        count
      });
    }
    
    return monthlyData;
  };

  // Get source distribution
  const getSourceDistribution = () => {
    const sources = {};
    filteredLeads.forEach(lead => {
      const source = lead.source || "Direct";
      sources[source] = (sources[source] || 0) + 1;
    });
    
    return Object.entries(sources)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Get status distribution
  const getStatusDistribution = () => {
    const statuses = {
      "New": filteredLeads.filter(l => l.status === "new").length,
      "Contacted": filteredLeads.filter(l => l.status === "contacted").length,
      "Converted": filteredLeads.filter(l => l.status === "converted").length
    };
    
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  };

  // Get conversion funnel data
  const getConversionFunnel = () => {
    const total = filteredLeads.length;
    const newLeads = filteredLeads.filter(l => l.status === "new").length;
    const contacted = filteredLeads.filter(l => l.status === "contacted").length;
    const converted = filteredLeads.filter(l => l.status === "converted").length;
    
    return [
      { stage: "Total Leads", count: total, percentage: 100 },
      { stage: "New", count: newLeads, percentage: total ? (newLeads / total * 100).toFixed(1) : 0 },
      { stage: "Contacted", count: contacted, percentage: total ? (contacted / total * 100).toFixed(1) : 0 },
      { stage: "Converted", count: converted, percentage: total ? (converted / total * 100).toFixed(1) : 0 }
    ];
  };

  // Get daily average
  const getDailyAverage = () => {
    const daysDiff = Math.ceil((new Date() - new Date(Math.min(...filteredLeads.map(l => new Date(l.createdAt))))) / (1000 * 60 * 60 * 24));
    const average = daysDiff > 0 ? (filteredLeads.length / daysDiff).toFixed(1) : 0;
    return average;
  };

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const sourceDistribution = getSourceDistribution();
  const statusDistribution = getStatusDistribution();
  const conversionFunnel = getConversionFunnel();
  const dailyAverage = getDailyAverage();

  const maxWeeklyCount = Math.max(...weeklyData.map(d => d.count), 1);
  const maxMonthlyCount = Math.max(...monthlyData.map(d => d.count), 1);

  const exportAnalytics = () => {
    const data = {
      metrics,
      trends,
      sourceDistribution,
      statusDistribution,
      weeklyData,
      monthlyData,
      conversionFunnel,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMetricColor = (metric) => {
    switch(metric) {
      case "new": return "text-blue-600 dark:text-blue-400";
      case "contacted": return "text-yellow-600 dark:text-yellow-400";
      case "converted": return "text-green-600 dark:text-green-400";
      default: return "text-gray-600";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your lead performance and conversion metrics
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportAnalytics}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={fetchLeads}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range:</span>
            </div>
            <div className="flex gap-2">
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
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Leads</p>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.total}</p>
                <div className="flex items-center mt-2">
                  {trends.isPositive ? (
                    <ArrowUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${trends.isPositive ? "text-green-500" : "text-red-500"}`}>
                    {Math.abs(trends.trend)}%
                  </span>
                  <span className="text-xs text-gray-500 ml-2">vs previous period</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600">{metrics.conversionRate}%</p>
                <p className="text-xs text-gray-500 mt-2">{metrics.converted} converted leads</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Daily Average</p>
                  <Activity className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-purple-600">{dailyAverage}</p>
                <p className="text-xs text-gray-500 mt-2">leads per day</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Leads</p>
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-yellow-600">{metrics.newLeads + metrics.contacted}</p>
                <p className="text-xs text-gray-500 mt-2">needs attention</p>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Weekly Trend */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {timeRange === "month" ? "Daily Trend" : "Weekly Trend"}
                  </h2>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                <div className="h-64">
                  <div className="flex h-full items-end space-x-2">
                    {(timeRange === "month" ? monthlyData : weeklyData).map((item, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-lg relative group">
                          <div 
                            className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
                            style={{ 
                              height: `${(item.count / (timeRange === "month" ? maxMonthlyCount : maxWeeklyCount)) * 200}px`,
                              width: "100%"
                            }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                              {item.count} leads
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {timeRange === "month" ? item.month : item.day}
                        </p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Source Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Sources</h2>
                  <PieChart className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {sourceDistribution.map((source, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{source.name}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{source.value}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                          style={{ width: `${(source.value / metrics.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Status Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Status Distribution</h2>
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {statusDistribution.map((status, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {status.name === "New" && <Clock className="w-4 h-4 text-blue-500" />}
                          {status.name === "Contacted" && <MessageSquare className="w-4 h-4 text-yellow-500" />}
                          {status.name === "Converted" && <CheckCircle className="w-4 h-4 text-green-500" />}
                          <span className="text-sm text-gray-600 dark:text-gray-400">{status.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{status.value}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            status.name === "New" ? "bg-blue-500" :
                            status.name === "Contacted" ? "bg-yellow-500" : "bg-green-500"
                          }`}
                          style={{ width: `${(status.value / metrics.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversion Funnel</h2>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {conversionFunnel.map((stage, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{stage.stage}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {stage.count} ({stage.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${stage.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 text-center">
                    {metrics.converted} out of {metrics.total} leads converted
                  </p>
                </div>
              </div>
            </div>

            {/* Insights Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Top Performing Source</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {sourceDistribution[0]?.name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {sourceDistribution[0]?.value || 0} leads ({sourceDistribution[0] ? ((sourceDistribution[0].value / metrics.total) * 100).toFixed(1) : 0}%)
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Best Conversion Day</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {weeklyData.reduce((max, day) => day.count > max.count ? day : max, { day: "N/A", count: 0 }).day}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {weeklyData.reduce((max, day) => day.count > max.count ? day : max, { count: 0 }).count} leads on average
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Conversion Goal</p>
                  <p className="text-xl font-bold text-green-600">{metrics.conversionRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {metrics.converted} leads converted
                  </p>
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