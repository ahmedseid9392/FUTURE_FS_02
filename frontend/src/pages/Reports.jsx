import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import API from "../services/api";
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock,
  BarChart3,
  PieChart,
  FileText,
  Filter,
  RefreshCw,
  Mail,
  Activity,
  Target,
  Award,
  AlertCircle
} from "lucide-react";

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [exportFormat, setExportFormat] = useState("csv");
  const [error, setError] = useState(null);

  // Fetch report data
  useEffect(() => {
    fetchReportData();
  }, [dateRange, customStartDate, customEndDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let params = {};
      
      if (dateRange === "custom" && customStartDate && customEndDate) {
        params = {
          startDate: customStartDate,
          endDate: customEndDate
        };
      } else {
        params = { range: dateRange };
      }
      
      console.log("Fetching reports with params:", params);
      
      const res = await API.get("/reports", { params });
      
      
      setReportData(res.data);
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      setError(error.response?.data?.message || "Failed to load reports");
      
      setReportData({
        totalLeads: 0,
        conversionRate: 0,
        avgResponseTime: 0,
        revenue: 0,
        leadTrend: [],
        sourceDistribution: [],
        sourcePerformance: [],
        bestDays: [],
        leadQualityScore: 0,
        funnelData: [],
        bottlenecks: [],
        recommendations: [],
        teamPerformance: [],
        leadVelocity: 0,
        followUpRate: 0,
        responseRate: 0,
        monthlyPerformance: []
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      let url;
      if (exportFormat === "csv") {
        url = `/reports/export/csv?range=${dateRange}`;
      } else {
        url = `/reports/export/json?range=${dateRange}`;
      }
      
      if (dateRange === "custom" && customStartDate && customEndDate) {
        url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      
      const res = await API.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { 
        type: exportFormat === "csv" ? 'text/csv' : 'application/json' 
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `crm_report_${new Date().toISOString().split('T')[0]}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Failed to export report:", error);
      alert("Failed to export report");
    }
  };

  const dateRanges = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" },
    { value: "custom", label: "Custom Range" }
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "leads", label: "Leads Analytics", icon: <Users className="w-4 h-4" /> },
    { id: "conversion", label: "Conversion Funnel", icon: <Target className="w-4 h-4" /> },
    { id: "performance", label: "Performance", icon: <TrendingUp className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Reports</h3>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <button
              onClick={fetchReportData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!reportData) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Calculate max count for chart scaling
  const maxCount = reportData.leadTrend?.length > 0 
    ? Math.max(...reportData.leadTrend.map(d => d.count), 1) 
    : 1;

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive insights into your lead performance and business growth
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {dateRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => {
                    setDateRange(range.value);
                    if (range.value !== "custom") setShowCustomDate(false);
                    else setShowCustomDate(true);
                  }}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    dateRange === range.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            {showCustomDate && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <span>to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={fetchReportData}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            )}
            <button
              onClick={fetchReportData}
              className="ml-auto p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

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

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.totalLeads || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                    <p className="text-2xl font-bold text-green-600">{reportData.conversionRate || 0}%</p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg Response Time</p>
                    <p className="text-2xl font-bold text-yellow-600">{reportData.avgResponseTime || 0} hrs</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Revenue Generated</p>
                    <p className="text-2xl font-bold text-purple-600">${reportData.revenue || 0}</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Lead Trend Chart - FIXED */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Trend</h2>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              {reportData.leadTrend && reportData.leadTrend.length > 0 ? (
                <div className="h-80">
                  <div className="flex h-full items-end space-x-2 overflow-x-auto pb-4">
                    {reportData.leadTrend.map((item, index) => {
                      const heightPercent = (item.count / maxCount) * 100;
                      const barHeight = Math.max(heightPercent, 5);
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center min-w-[50px]">
                          <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-lg relative group">
                            <div 
                              className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
                              style={{ height: `${barHeight}%`, minHeight: '4px' }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                {item.count} leads
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                            {item.label?.substring(0, 10) || 'N/A'}
                          </p>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">
                            {item.count}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Lead Trend Data</h3>
                  <p className="text-gray-500 dark:text-gray-400">No leads found for the selected period</p>
                  <p className="text-sm text-gray-400 mt-2">Add leads to see trend analysis</p>
                </div>
              )}
            </div>

            {/* Source Distribution */}
            {reportData.sourceDistribution && reportData.sourceDistribution.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Sources</h2>
                  <PieChart className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {reportData.sourceDistribution.map((source, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{source.name}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{source.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="text-center py-12">
                  <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Source Data</h3>
                  <p className="text-gray-500 dark:text-gray-400">No lead sources found for the selected period</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leads Analytics Tab */}
        {activeTab === "leads" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lead Acquisition by Channel</h2>
              {reportData.sourcePerformance && reportData.sourcePerformance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Source</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Leads</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Conversion Rate</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</th>
                       </tr>
                    </thead>
                    <tbody>
                      {reportData.sourcePerformance.map((source, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 text-gray-900 dark:text-white">{source.name}</td>
                          <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{source.count}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              source.conversionRate >= 30 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                              source.conversionRate >= 15 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {source.conversionRate}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-green-600 dark:text-green-400">${source.revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No lead source data available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conversion Funnel Tab */}
        {activeTab === "conversion" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Conversion Funnel</h2>
              {reportData.funnelData && reportData.funnelData.length > 0 ? (
                <div className="space-y-4">
                  {reportData.funnelData.map((stage, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stage.stage}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{stage.count} leads ({stage.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8">
                        <div 
                          className={`h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium transition-all ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-blue-400' :
                            index === 2 ? 'bg-blue-300' : 'bg-blue-200'
                          }`}
                          style={{ width: `${stage.percentage}%` }}
                        >
                          {stage.percentage > 15 && `${stage.percentage}%`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No conversion data available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === "performance" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.leadVelocity?.toFixed(1) || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Lead Velocity (per day)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.followUpRate || 0}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Follow-up Rate</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.responseRate || 0}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Response Rate</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;