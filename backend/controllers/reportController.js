import Lead from '../models/Lead.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Get date range based on range parameter
const getDateRange = (range, customStartDate, customEndDate) => {
  const now = new Date();
  let startDate, endDate = new Date();
  
  switch(range) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - now.getDay()));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date();
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date();
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date();
      break;
    case 'custom':
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date();
  }
  
  return { startDate, endDate };
};

// Get previous period date range
const getPreviousPeriodRange = (range, startDate, endDate) => {
  const duration = endDate - startDate;
  const prevEndDate = new Date(startDate);
  const prevStartDate = new Date(startDate - duration);
  
  return { startDate: prevStartDate, endDate: prevEndDate };
};

// Main reports endpoint
export const getReports = async (req, res) => {
  try {
    const { range, startDate: customStart, endDate: customEnd } = req.query;
    const { startDate, endDate } = getDateRange(range, customStart, customEnd);
    
    // Get leads in date range
    const leads = await Lead.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Get previous period leads for growth calculation
    const prevRange = getPreviousPeriodRange(range, startDate, endDate);
    const prevLeads = await Lead.find({
      createdAt: { $gte: prevRange.startDate, $lte: prevRange.endDate }
    });
    
    const totalLeads = leads.length;
    const prevTotalLeads = prevLeads.length;
    const leadGrowth = prevTotalLeads ? ((totalLeads - prevTotalLeads) / prevTotalLeads * 100).toFixed(1) : 0;
    
    // Status counts
    const newLeads = leads.filter(l => l.status === 'new').length;
    const contactedLeads = leads.filter(l => l.status === 'contacted').length;
    const convertedLeads = leads.filter(l => l.status === 'converted').length;
    const conversionRate = totalLeads ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
    
    const prevConverted = prevLeads.filter(l => l.status === 'converted').length;
    const prevConversionRate = prevTotalLeads ? ((prevConverted / prevTotalLeads) * 100).toFixed(1) : 0;
    const conversionGrowth = (conversionRate - prevConversionRate).toFixed(1);
    
    // Lead trend by day/week
    const leadTrend = [];
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    for (let i = 0; i <= Math.min(daysDiff, 30); i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const count = leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate.toDateString() === date.toDateString();
      }).length;
      leadTrend.push({
        label: date.toLocaleDateString(),
        count
      });
    }
    
    // Source distribution
    const sourceMap = {};
    leads.forEach(lead => {
      const source = lead.source || 'Direct';
      sourceMap[source] = (sourceMap[source] || 0) + 1;
    });
    const sourceDistribution = Object.entries(sourceMap).map(([name, count]) => ({
      name,
      count,
      percentage: totalLeads ? ((count / totalLeads) * 100).toFixed(1) : 0
    }));
    
    // Source performance
    const sourcePerformance = await Promise.all(sourceDistribution.map(async (source) => {
      const sourceLeads = leads.filter(l => (l.source || 'Direct') === source.name);
      const converted = sourceLeads.filter(l => l.status === 'converted').length;
      const conversionRate = sourceLeads.length ? ((converted / sourceLeads.length) * 100).toFixed(1) : 0;
      const revenue = converted * 1000; // Example calculation
      
      return {
        name: source.name,
        count: sourceLeads.length,
        conversionRate,
        revenue
      };
    }));
    
    // Best performing days
    const dayCount = {};
    leads.forEach(lead => {
      const day = new Date(lead.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    const bestDays = Object.entries(dayCount).map(([name, count]) => ({ name, count }));
    
    // Lead quality score (example calculation)
    const leadQualityScore = totalLeads ? 
      Math.min(100, Math.floor((convertedLeads / totalLeads) * 100 + (contactedLeads / totalLeads) * 50)) : 0;
    
    // Funnel data
    const funnelData = [
      { stage: 'Total Leads', count: totalLeads, percentage: 100 },
      { stage: 'New', count: newLeads, percentage: totalLeads ? ((newLeads / totalLeads) * 100).toFixed(1) : 0 },
      { stage: 'Contacted', count: contactedLeads, percentage: totalLeads ? ((contactedLeads / totalLeads) * 100).toFixed(1) : 0 },
      { stage: 'Converted', count: convertedLeads, percentage: totalLeads ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0 }
    ];
    
    // Bottlenecks
    const bottlenecks = [];
    if (newLeads > 0 && contactedLeads / newLeads < 0.5) {
      bottlenecks.push({
        stage: 'New to Contacted',
        description: 'Low conversion rate from new to contacted leads. Follow up faster.',
        impact: ((newLeads - contactedLeads) / newLeads * 100).toFixed(1)
      });
    }
    if (contactedLeads > 0 && convertedLeads / contactedLeads < 0.3) {
      bottlenecks.push({
        stage: 'Contacted to Converted',
        description: 'Low conversion rate from contacted to converted. Improve sales pitch.',
        impact: ((contactedLeads - convertedLeads) / contactedLeads * 100).toFixed(1)
      });
    }
    
    // Recommendations
    const recommendations = [];
    if (newLeads > contactedLeads) {
      recommendations.push('Increase follow-up rate for new leads to improve conversion');
    }
    if (convertedLeads < contactedLeads * 0.3) {
      recommendations.push('Review sales process and provide additional training');
    }
    if (sourceDistribution.length > 0) {
      const topSource = sourceDistribution[0];
      recommendations.push(`Focus marketing efforts on ${topSource.name} which generates ${topSource.percentage}% of leads`);
    }
    
    // Team performance (example data)
    const users = await User.find({ role: 'user' });
    const teamPerformance = users.map(user => ({
      name: user.fullName || user.username,
      leadsAssigned: Math.floor(Math.random() * 50) + 10,
      conversions: Math.floor(Math.random() * 20) + 1,
      conversionRate: Math.floor(Math.random() * 60) + 10,
      avgResponseTime: Math.floor(Math.random() * 24) + 1
    }));
    
    // Time metrics
    const avgTimeToContact = 24; // Example value in hours
    const avgTimeToConvert = 14; // Example value in days
    const leadVelocity = totalLeads / (daysDiff || 1);
    const avgLeadValue = 500; // Example value in dollars
    const followUpRate = contactedLeads ? ((contactedLeads / newLeads) * 100).toFixed(1) : 0;
    const responseRate = 45; // Example value in percentage
    const leadToConversionRate = totalLeads ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
    
    // Monthly performance
    const monthlyPerformance = [];
    for (let i = 0; i < 12; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthLeads = await Lead.find({
        createdAt: {
          $gte: new Date(month.getFullYear(), month.getMonth(), 1),
          $lt: new Date(month.getFullYear(), month.getMonth() + 1, 1)
        }
      });
      const monthConversions = monthLeads.filter(l => l.status === 'converted').length;
      monthlyPerformance.unshift({
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        leads: monthLeads.length,
        conversions: monthConversions
      });
    }
    
    // Revenue (example calculation)
    const revenue = convertedLeads * 500;
    
    res.json({
      totalLeads,
      leadGrowth,
      conversionRate,
      conversionGrowth,
      avgResponseTime: avgTimeToContact,
      revenue,
      newLeads,
      contactedLeads,
      convertedLeads,
      leadTrend,
      sourceDistribution,
      sourcePerformance,
      bestDays,
      leadQualityScore,
      funnelData,
      bottlenecks,
      recommendations,
      teamPerformance,
      avgTimeToContact,
      avgTimeToConvert,
      leadVelocity,
      avgLeadValue,
      followUpRate,
      responseRate,
      leadToConversionRate,
      monthlyPerformance
    });
    
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export report
export const exportReport = async (req, res) => {
  try {
    const { format, range, startDate, endDate } = req.query;
    const { startDate: rangeStart, endDate: rangeEnd } = getDateRange(range, startDate, endDate);
    
    const leads = await Lead.find({
      createdAt: { $gte: rangeStart, $lte: rangeEnd }
    });
    
    if (format === 'csv') {
      const headers = ['Name', 'Email', 'Phone', 'Source', 'Status', 'Created At'];
      const csvData = leads.map(lead => [
        lead.name,
        lead.email,
        lead.phone || '',
        lead.source || '',
        lead.status,
        new Date(lead.createdAt).toISOString()
      ]);
      
      const csv = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=report_${Date.now()}.csv`);
      res.send(csv);
    } else {
      res.json({
        generatedAt: new Date(),
        dateRange: { start: rangeStart, end: rangeEnd },
        totalLeads: leads.length,
        leads
      });
    }
    
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};