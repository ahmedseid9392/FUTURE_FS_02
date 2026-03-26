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
  LineChart,
  FileText,
  Filter,
  RefreshCw,
  ChevronDown,
  Mail,
  Printer,
  Share2,
  Eye,
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
  const [exportFormat, setExportFormat] = useState("pdf");

  // Fetch report data
  useEffect(() => {
    fetchReportData();
  }, [dateRange, customStartDate, customEndDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const res = await API.get("/reports/export", {
        params: { format: exportFormat, range: dateRange },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `crm_report_${new Date().toISOString().split('T')[0]}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
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
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
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
        {activeTab === "overview" && reportData && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.totalLeads}</p>
                    <p className={`text-xs mt-1 ${reportData.leadGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {reportData.leadGrowth >= 0 ? '+' : ''}{reportData.leadGrowth}% from previous period
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                    <p className="text-2xl font-bold text-green-600">{reportData.conversionRate}%</p>
                    <p className={`text-xs mt-1 ${reportData.conversionGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {reportData.conversionGrowth >= 0 ? '+' : ''}{reportData.conversionGrowth}% from previous
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg Response Time</p>
                    <p className="text-2xl font-bold text-yellow-600">{reportData.avgResponseTime} hrs</p>
                    <p className="text-xs text-gray-500 mt-1">First contact to lead</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Revenue Generated</p>
                    <p className="text-2xl font-bold text-purple-600">${reportData.revenue}</p>
                    <p className="text-xs text-gray-500 mt-1">From converted leads</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Trend Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Trend</h2>
                  <LineChart className="w-5 h-5 text-gray-400" />
                </div>
                <div className="h-64">
                  <div className="flex h-full items-end space-x-2">
                    {reportData.leadTrend?.map((item, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-lg relative group">
                          <div 
                            className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
                            style={{ height: `${(item.count / Math.max(...reportData.leadTrend.map(d => d.count), 1)) * 200}px` }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                              {item.count} leads
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{item.label}</p>
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
                  {reportData.sourceDistribution?.map((source, index) => (
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
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Status</h2>
                  <PieChart className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">New</span>
                      <span className="text-sm font-semibold text-blue-600">{reportData.newLeads}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(reportData.newLeads / reportData.totalLeads) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Contacted</span>
                      <span className="text-sm font-semibold text-yellow-600">{reportData.contactedLeads}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(reportData.contactedLeads / reportData.totalLeads) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Converted</span>
                      <span className="text-sm font-semibold text-green-600">{reportData.convertedLeads}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(reportData.convertedLeads / reportData.totalLeads) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Key Metrics</h2>
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.avgLeadValue}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg Lead Value</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.leadVelocity}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Lead Velocity (per day)</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.followUpRate}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Follow-up Rate</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.responseRate}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Response Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leads Analytics Tab */}
        {activeTab === "leads" && reportData && (
          <div className="space-y-6">
            {/* Lead Acquisition */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lead Acquisition by Channel</h2>
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
                    {reportData.sourcePerformance?.map((source, index) => (
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
            </div>

            {/* Time Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Best Performing Days</h2>
                <div className="space-y-3">
                  {reportData.bestDays?.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{day.name}</span>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(day.count / Math.max(...reportData.bestDays.map(d => d.count))) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{day.count} leads</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lead Quality Score</h2>
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-48 h-48">
                      <circle
                        className="text-gray-200 dark:text-gray-700"
                        strokeWidth="12"
                        stroke="currentColor"
                        fill="transparent"
                        r="88"
                        cx="96"
                        cy="96"
                      />
                      <circle
                        className="text-green-500"
                        strokeWidth="12"
                        strokeDasharray={2 * Math.PI * 88}
                        strokeDashoffset={2 * Math.PI * 88 * (1 - reportData.leadQualityScore / 100)}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="88"
                        cx="96"
                        cy="96"
                      />
                    </svg>
                    <span className="absolute text-3xl font-bold text-gray-900 dark:text-white">
                      {reportData.leadQualityScore}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Overall Lead Quality Score</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversion Funnel Tab */}
        {activeTab === "conversion" && reportData && (
          <div className="space-y-6">
            {/* Funnel Visualization */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Conversion Funnel</h2>
              <div className="space-y-4">
                {reportData.funnelData?.map((stage, index) => (
                  <div key={index} className="relative">
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
                    {index < reportData.funnelData.length - 1 && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-4">
                        <div className="text-xs text-gray-400">
                          {stage.dropoff}% dropoff
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottlenecks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversion Bottlenecks</h2>
              <div className="space-y-4">
                {reportData.bottlenecks?.map((bottleneck, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-300">{bottleneck.stage}</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">{bottleneck.description}</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">Impact: {bottleneck.impact}% conversion loss</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h2>
              <ul className="space-y-2">
                {reportData.recommendations?.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === "performance" && reportData && (
          <div className="space-y-6">
            {/* Team Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Performance</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Team Member</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Leads Assigned</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Conversions</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Conversion Rate</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.teamPerformance?.map((member, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4 text-gray-900 dark:text-white">{member.name}</td>
                        <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{member.leadsAssigned}</td>
                        <td className="py-3 px-4 text-right text-green-600 dark:text-green-400">{member.conversions}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.conversionRate >= 40 ? 'bg-green-100 text-green-700' :
                            member.conversionRate >= 20 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {member.conversionRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{member.avgResponseTime} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Time Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 text-center">
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.avgTimeToContact} hrs</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Time to First Contact</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.avgTimeToConvert} days</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Time to Conversion</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 text-center">
                <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.leadToConversionRate}%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Lead to Conversion Rate</p>
              </div>
            </div>

            {/* Monthly Performance Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Performance Trend</h2>
              <div className="h-64">
                <div className="flex h-full items-end space-x-2">
                  {reportData.monthlyPerformance?.map((month, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full space-y-1">
                        <div className="bg-green-100 dark:bg-green-900/30 rounded-t-lg relative group">
                          <div 
                            className="bg-green-500 rounded-t-lg transition-all"
                            style={{ height: `${(month.conversions / Math.max(...reportData.monthlyPerformance.map(m => m.conversions), 1)) * 150}px` }}
                          />
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-t-lg relative group">
                          <div 
                            className="bg-blue-500 rounded-t-lg transition-all"
                            style={{ height: `${(month.leads / Math.max(...reportData.monthlyPerformance.map(m => m.leads), 1)) * 150}px` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{month.month}</p>
                      <p className="text-xs text-gray-400">{month.leads} leads</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-xs text-gray-600">Leads</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-600">Conversions</span>
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