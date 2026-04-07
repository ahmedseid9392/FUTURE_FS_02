import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import {
  TrendingUp,
  Users,
  Calendar,
  PieChart,
  Activity,
  CheckCircle,
  AlertCircle,
  BarChart3,
  TrendingDown
} from "lucide-react";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('bar');

  // Fetch reports data from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);


      const res = await API.get("/reports", { params: { range: timeRange } });

      setReportData(res.data);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setError(error.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const exportAnalytics = () => {
    if (!reportData) return;

    const data = {
      metrics: {
        total: reportData.totalLeads,
        new: reportData.newLeads,
        contacted: reportData.contactedLeads,
        converted: reportData.convertedLeads,
        conversionRate: reportData.conversionRate
      },
      sourceDistribution: reportData.sourceDistribution,
      leadTrend: reportData.leadTrend,
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

  // Safe data access with fallbacks
  const leadTrend = reportData?.leadTrend || [];
  const sourceDistribution = reportData?.sourceDistribution || [];
  const metrics = {
    total: reportData?.totalLeads || 0,
    new: reportData?.newLeads || 0,
    contacted: reportData?.contactedLeads || 0,
    converted: reportData?.convertedLeads || 0,
    conversionRate: reportData?.conversionRate || 0
  };

  const maxCount = leadTrend.length > 0 ? Math.max(...leadTrend.map(d => d.count), 1) : 1;

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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Analytics</h3>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <button
              onClick={fetchReports}
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
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
            <p className="text-gray-500 dark:text-gray-400">No leads found for the selected period</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your lead performance and conversion metrics</p>
          </div>

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
                  className={`px-4 py-2 rounded-lg capitalize transition ${timeRange === range
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

        {/* Lead Trend Section - Enhanced Version */}
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

          {leadTrend.length > 0 ? (
            <div>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {leadTrend.reduce((sum, day) => sum + day.count, 0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Leads</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.max(...leadTrend.map(d => d.count), 0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Highest Day</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {leadTrend.length > 0 ? (leadTrend.reduce((sum, day) => sum + day.count, 0) / leadTrend.length).toFixed(1) : 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Daily Average</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {leadTrend.length > 0 && leadTrend[leadTrend.length - 1]?.count || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Latest Day</p>
                </div>
              </div>

              {/* Chart */}
              <div className="h-80">
                {chartType === 'bar' ? (
                  <div className="flex h-full items-end space-x-2 overflow-x-auto pb-4">
                    {leadTrend.map((item, index) => {
                      const maxCount = Math.max(...leadTrend.map(d => d.count), 1);
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
                      {/* Grid lines */}
                      <line x1="0" y1="240" x2="800" y2="240" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                      <line x1="0" y1="180" x2="800" y2="180" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                      <line x1="0" y1="120" x2="800" y2="120" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                      <line x1="0" y1="60" x2="800" y2="60" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />

                      {/* Line chart */}
                      <polyline
                        points={leadTrend.map((item, i) => {
                          const x = (i / (leadTrend.length - 1)) * 800;
                          const maxCount = Math.max(...leadTrend.map(d => d.count), 1);
                          const y = 240 - (item.count / maxCount) * 200;
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        className="dark:stroke-blue-400"
                      />

                      {/* Area under line */}
                      <polygon
                        points={`0,240 ${leadTrend.map((item, i) => {
                          const x = (i / (leadTrend.length - 1)) * 800;
                          const maxCount = Math.max(...leadTrend.map(d => d.count), 1);
                          const y = 240 - (item.count / maxCount) * 200;
                          return `${x},${y}`;
                        }).join(' ')} 800,240 0,240`}
                        fill="rgba(59, 130, 246, 0.1)"
                      />

                      {/* Data points */}
                      {leadTrend.map((item, i) => {
                        const x = (i / (leadTrend.length - 1)) * 800;
                        const maxCount = Math.max(...leadTrend.map(d => d.count), 1);
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
                              className="cursor-pointer hover:r-7 transition-all dark:fill-blue-400"
                            />
                            <title>{`${item.label}: ${item.count} leads`}</title>
                          </g>
                        );
                      })}
                    </svg>

                    {/* X-axis labels */}
                    <div className="flex justify-between mt-2 px-2">
                      {leadTrend.map((item, i) => (
                        <div key={i} className="text-center text-xs text-gray-500 dark:text-gray-400" style={{ width: `${100 / leadTrend.length}%` }}>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Trend Indicator */}
              {leadTrend.length >= 2 && (
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Trend:</span>
                      {(() => {
                        const firstWeek = leadTrend.slice(0, Math.ceil(leadTrend.length / 2)).reduce((sum, d) => sum + d.count, 0);
                        const secondWeek = leadTrend.slice(Math.ceil(leadTrend.length / 2)).reduce((sum, d) => sum + d.count, 0);
                        const percentChange = firstWeek ? ((secondWeek - firstWeek) / firstWeek * 100).toFixed(1) : 0;
                        const isIncreasing = percentChange > 0;

                        return (
                          <div className={`flex items-center gap-1 ${isIncreasing ? 'text-green-600' : 'text-red-600'}`}>
                            {isIncreasing ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span className="font-semibold">{Math.abs(percentChange)}%</span>
                            <span className="text-gray-500 text-sm ml-1">
                              {isIncreasing ? 'increase' : 'decrease'} in second half
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="text-xs text-gray-400">
                      Based on {leadTrend.length} days
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Sources</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          {sourceDistribution.length > 0 ? (
            <div className="space-y-4">
              {sourceDistribution.map((source, i) => (
                <div key={i}>
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
          ) : (
            <div className="text-center py-12">
              <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No source data available</p>
              <p className="text-sm text-gray-400 mt-2">Add leads to see source distribution</p>
            </div>
          )}
        </div>

        {/* Key Insights Section */}
        {sourceDistribution.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Top Source</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{sourceDistribution[0]?.name || "N/A"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sourceDistribution[0]?.value || 0} leads ({sourceDistribution[0]?.percentage || 0}%)</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Best Day</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {leadTrend.reduce((max, day) => day.count > max.count ? day : max, { day: "N/A", count: 0 }).day || "N/A"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">highest lead day</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Conversion Rate</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{metrics.conversionRate}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metrics.converted} converted leads</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;