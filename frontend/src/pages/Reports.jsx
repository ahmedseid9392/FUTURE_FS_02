import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import API from "../services/api";
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,

  Clock,
  BarChart3,
  PieChart,

  RefreshCw,

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
  const [chartType, setChartType] = useState("bar"); // Add chart type state

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
                  className={`px-3 py-1 rounded-lg text-sm transition ${dateRange === range.value
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
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.id
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

        {/* Overview Tab - Lead Trend Section */}
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

            {/* Lead Trend Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Trend</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Track your lead acquisition over time
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-3 py-1 text-sm rounded-lg transition ${chartType === 'bar'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                      }`}
                  >
                    Bar Chart
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-3 py-1 text-sm rounded-lg transition ${chartType === 'line'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                      }`}
                  >
                    Line Chart
                  </button>
                </div>
              </div>

              {reportData.leadTrend && reportData.leadTrend.length > 0 ? (
                <div>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {reportData.leadTrend.reduce((sum, day) => sum + day.count, 0)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Leads</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {Math.max(...reportData.leadTrend.map(d => d.count), 0)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Highest Day</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {(reportData.leadTrend.reduce((sum, day) => sum + day.count, 0) / reportData.leadTrend.length).toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Daily Average</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {reportData.leadTrend[reportData.leadTrend.length - 1]?.count || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Latest Day</p>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-80">
                    {chartType === 'bar' ? (
                      <div className="flex h-full items-end space-x-2 overflow-x-auto pb-4">
                        {reportData.leadTrend.map((item, index) => {
                          const maxCount = Math.max(...reportData.leadTrend.map(d => d.count), 1);
                          const heightPercent = (item.count / maxCount) * 100;
                          const barHeight = Math.max(heightPercent, 5);
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center min-w-[60px] group">
                              <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-lg relative">
                                <div
                                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 cursor-pointer hover:from-blue-600 hover:to-blue-500"
                                  style={{ height: `${barHeight}%`, minHeight: '4px' }}
                                >
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
                                    {item.count} leads
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center font-medium">
                                {item.label}
                              </p>
                              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-1">
                                {item.count}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="relative h-full">
                        <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                          <line x1="0" y1="240" x2="800" y2="240" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                          <line x1="0" y1="180" x2="800" y2="180" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                          <line x1="0" y1="120" x2="800" y2="120" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                          <line x1="0" y1="60" x2="800" y2="60" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />

                          <polyline
                            points={reportData.leadTrend.map((item, i) => {
                              const x = (i / (reportData.leadTrend.length - 1)) * 800;
                              const maxCount = Math.max(...reportData.leadTrend.map(d => d.count), 1);
                              const y = 240 - (item.count / maxCount) * 200;
                              return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            className="dark:stroke-blue-400"
                          />

                          <polygon
                            points={`0,240 ${reportData.leadTrend.map((item, i) => {
                              const x = (i / (reportData.leadTrend.length - 1)) * 800;
                              const maxCount = Math.max(...reportData.leadTrend.map(d => d.count), 1);
                              const y = 240 - (item.count / maxCount) * 200;
                              return `${x},${y}`;
                            }).join(' ')} 800,240 0,240`}
                            fill="rgba(59, 130, 246, 0.1)"
                          />

                          {reportData.leadTrend.map((item, i) => {
                            const x = (i / (reportData.leadTrend.length - 1)) * 800;
                            const maxCount = Math.max(...reportData.leadTrend.map(d => d.count), 1);
                            const y = 240 - (item.count / maxCount) * 200;
                            return (
                              <g key={i}>
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="5"
                                  fill="#3b82f6"
                                  stroke="white"
                                  strokeWidth="2"
                                  className="cursor-pointer hover:r-7 transition-all"
                                />
                                <title>{`${item.label}: ${item.count} leads`}</title>
                              </g>
                            );
                          })}
                        </svg>

                        <div className="flex justify-between mt-2 px-2">
                          {reportData.leadTrend.map((item, i) => (
                            <div key={i} className="text-center text-xs text-gray-500 dark:text-gray-400" style={{ width: `${100 / reportData.leadTrend.length}%` }}>
                              {item.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Trend Indicator */}
                  {reportData.leadTrend.length >= 2 && (
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Trend:</span>
                          {(() => {
                            const firstHalf = reportData.leadTrend.slice(0, Math.ceil(reportData.leadTrend.length / 2)).reduce((sum, d) => sum + d.count, 0);
                            const secondHalf = reportData.leadTrend.slice(Math.ceil(reportData.leadTrend.length / 2)).reduce((sum, d) => sum + d.count, 0);
                            const percentChange = firstHalf ? ((secondHalf - firstHalf) / firstHalf * 100).toFixed(1) : 0;
                            const isIncreasing = percentChange > 0;

                            return (
                              <div className={`flex items-center gap-1 ${isIncreasing ? 'text-green-600' : 'text-red-600'}`}>
                                {isIncreasing ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                <span className="font-semibold">{Math.abs(percentChange)}%</span>
                                <span className="text-gray-500 text-sm ml-1">
                                  {isIncreasing ? 'increase' : 'decrease'} in second half
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="text-xs text-gray-400">
                          Based on {reportData.leadTrend.length} days
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
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
      </div>
    </Layout>
  );
};

export default Reports;