import Lead from '../models/Lead.js';
import User from '../models/User.js';

// Helper function to get date range
const getDateRange = (range, customStartDate, customEndDate) => {
  const now = new Date();
  let startDate, endDate = new Date();
  
  switch(range) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      break;
    case 'all':
      startDate = new Date(2000, 0, 1);
      endDate = new Date();
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date();
  }
  
  return { startDate, endDate };
};

// Get reports for current user
export const getReports = async (req, res) => {
  try {
    const { range } = req.query;
    const { startDate, endDate } = getDateRange(range);
    
   
    
    // Get leads for current user within date range
    const leads = await Lead.find({
      userId: req.user.id,
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${leads.length} leads for user ${req.user.email}`);
    
    const totalLeads = leads.length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const contactedLeads = leads.filter(l => l.status === 'contacted').length;
    const convertedLeads = leads.filter(l => l.status === 'converted').length;
    const conversionRate = totalLeads ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
    
    // Lead trend by day (last 7 days for week view, last 30 for month)
    const leadTrend = [];
    const daysToShow = range === 'week' ? 7 : 30;
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      const count = leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= date && leadDate < nextDate;
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
    const sourcePerformance = sourceDistribution.map(source => {
      const sourceLeads = leads.filter(l => (l.source || 'Direct') === source.name);
      const converted = sourceLeads.filter(l => l.status === 'converted').length;
      const conversionRate = sourceLeads.length ? ((converted / sourceLeads.length) * 100).toFixed(1) : 0;
      const revenue = converted * 500;
      
      return {
        name: source.name,
        count: sourceLeads.length,
        conversionRate,
        revenue
      };
    });
    
    // Best performing days
    const dayCount = {};
    leads.forEach(lead => {
      const day = new Date(lead.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    const bestDays = Object.entries(dayCount).map(([name, count]) => ({ name, count }));
    
    // Lead quality score
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
    
    // Team performance
    const currentUser = await User.findById(req.user.id);
    const teamPerformance = [{
      name: currentUser.fullName || currentUser.username,
      leadsAssigned: totalLeads,
      conversions: convertedLeads,
      conversionRate: conversionRate,
      avgResponseTime: 24
    }];
    
    // Time metrics
    const avgTimeToContact = 24;
    const avgTimeToConvert = totalLeads && convertedLeads ? ((convertedLeads / totalLeads) * 14).toFixed(1) : 0;
    const leadVelocity = totalLeads / 30;
    const avgLeadValue = convertedLeads ? (convertedLeads * 500) / convertedLeads : 0;
    const followUpRate = newLeads ? ((contactedLeads / newLeads) * 100).toFixed(1) : 0;
    const responseRate = 45;
    const leadToConversionRate = totalLeads ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
    
    // Monthly performance
    const monthlyPerformance = [];
    for (let i = 0; i < 12; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      
      const monthLeads = leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= monthStart && leadDate <= monthEnd;
      });
      
      const monthConversions = monthLeads.filter(l => l.status === 'converted').length;
      monthlyPerformance.unshift({
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        leads: monthLeads.length,
        conversions: monthConversions
      });
    }
    
    const revenue = convertedLeads * 500;
    
   
    
    res.json({
      totalLeads,
      leadGrowth: 0,
      conversionRate,
      conversionGrowth: 0,
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

// Export report as CSV
export const exportReportCSV = async (req, res) => {
  try {
    const { range } = req.query;
    const { startDate, endDate } = getDateRange(range);
    
    const leads = await Lead.find({
      userId: req.user.id,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const headers = ['Name', 'Email', 'Phone', 'Source', 'Status', 'Created At'];
    const csvRows = leads.map(lead => [
      `"${lead.name.replace(/"/g, '""')}"`,
      `"${lead.email.replace(/"/g, '""')}"`,
      `"${(lead.phone || '').replace(/"/g, '""')}"`,
      `"${(lead.source || 'Direct').replace(/"/g, '""')}"`,
      `"${lead.status}"`,
      `"${new Date(lead.createdAt).toISOString()}"`
    ]);
    
    const csv = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=report_${Date.now()}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Export failed' });
  }
};

// Export report as JSON
export const exportReportJSON = async (req, res) => {
  try {
    const { range } = req.query;
    const { startDate, endDate } = getDateRange(range);
    
    const leads = await Lead.find({
      userId: req.user.id,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      dateRange: { start: startDate, end: endDate },
      totalLeads: leads.length,
      leads: leads.map(lead => ({
        id: lead._id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        status: lead.status,
        notes: lead.notes,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt
      }))
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=report_${Date.now()}.json`);
    res.json(exportData);
    
  } catch (error) {
    console.error('Export JSON error:', error);
    res.status(500).json({ message: 'Export failed' });
  }
};