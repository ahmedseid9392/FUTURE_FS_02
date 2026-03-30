import Lead from '../models/Lead.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Export all user data
export const exportAllData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch all user-specific data
    const [leads, messages, conversations, events, notifications, user] = await Promise.all([
      Lead.find({ userId }),
      Message.find({ userId }),
      Conversation.find({ userId }),
      Event.find({ userId }),
      Notification.find({ userId }),
      User.findById(userId).select('-password')
    ]);
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt
      },
      statistics: {
        totalLeads: leads.length,
        totalMessages: messages.length,
        totalConversations: conversations.length,
        totalEvents: events.length,
        totalNotifications: notifications.length,
        leadStatus: {
          new: leads.filter(l => l.status === 'new').length,
          contacted: leads.filter(l => l.status === 'contacted').length,
          converted: leads.filter(l => l.status === 'converted').length
        }
      },
      data: {
        leads,
        messages,
        conversations,
        events,
        notifications
      }
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=leadcrm_export_${userId}_${Date.now()}.json`);
    res.json(exportData);
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Export failed' });
  }
};

// Export leads only
export const exportLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    const csvHeaders = ['ID', 'Name', 'Email', 'Phone', 'Source', 'Status', 'Created At', 'Updated At'];
    const csvRows = leads.map(lead => [
      lead._id,
      lead.name,
      lead.email,
      lead.phone || '',
      lead.source || 'Direct',
      lead.status,
      new Date(lead.createdAt).toISOString(),
      new Date(lead.updatedAt).toISOString()
    ]);
    
    const csv = [csvHeaders, ...csvRows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=leads_${Date.now()}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Export leads error:', error);
    res.status(500).json({ message: 'Export failed' });
  }
};

// Export messages only
export const exportMessages = async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    const csvHeaders = ['ID', 'Subject', 'Message', 'Recipient', 'Direction', 'Read', 'Created At'];
    const csvRows = messages.map(msg => [
      msg._id,
      msg.subject,
      msg.text.substring(0, 100).replace(/"/g, '""'),
      msg.recipientEmail,
      msg.direction,
      msg.isRead ? 'Yes' : 'No',
      new Date(msg.createdAt).toISOString()
    ]);
    
    const csv = [csvHeaders, ...csvRows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=messages_${Date.now()}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Export messages error:', error);
    res.status(500).json({ message: 'Export failed' });
  }
};

// Export calendar events only
export const exportEvents = async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user.id }).sort({ startDate: -1 });
    
    const csvHeaders = ['ID', 'Title', 'Type', 'Start Date', 'End Date', 'Location', 'Reminder'];
    const csvRows = events.map(event => [
      event._id,
      event.title,
      event.type,
      new Date(event.startDate).toISOString(),
      new Date(event.endDate).toISOString(),
      event.location || '',
      `${event.reminder} minutes`
    ]);
    
    const csv = [csvHeaders, ...csvRows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=calendar_${Date.now()}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Export events error:', error);
    res.status(500).json({ message: 'Export failed' });
  }
};