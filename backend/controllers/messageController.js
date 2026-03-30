import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import { sendEmail } from '../services/emailService.js';

// Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    console.log('Fetching conversations for user:', req.user.id);
    
    const conversations = await Conversation.find({
      'participants.userId': { $in: [req.user.id, null] }
    })
    .sort({ lastMessageAt: -1 })
    .limit(50);
    
    // Enrich with contact details
    const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
      const leadParticipant = conv.participants.find(p => p.role === 'lead');
      let contact = null;
      
      if (leadParticipant && leadParticipant.userId) {
        const lead = await Lead.findById(leadParticipant.userId);
        if (lead) {
          contact = {
            name: lead.name,
            email: lead.email,
            phone: lead.phone
          };
        }
      } else if (leadParticipant) {
        contact = {
          name: leadParticipant.name,
          email: leadParticipant.email
        };
      }
      
      return {
        id: conv._id,
        contact,
        subject: conv.subject,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadCount,
        starred: conv.starred,
        status: conv.status
      };
    }));
    
    res.json(enrichedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching messages for conversation:', id);
    
    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { conversationId: id, isRead: false, direction: 'incoming' },
      { $set: { isRead: true } }
    );
    
    // Reset unread count
    await Conversation.findByIdAndUpdate(id, { unreadCount: 0 });
    
    // Enrich messages with sender info
    const enrichedMessages = await Promise.all(messages.map(async (msg) => {
      let senderName = msg.senderName;
      if (msg.senderId) {
        const user = await User.findById(msg.senderId);
        if (user) senderName = user.fullName || user.username;
      }
      
      return {
        id: msg._id,
        senderId: msg.senderId,
        senderName: senderName,
        senderEmail: msg.senderEmail,
        text: msg.text,
        subject: msg.subject,
        isRead: msg.isRead,
        isStarred: msg.isStarred,
        direction: msg.direction,
        createdAt: msg.createdAt
      };
    }));
    
    res.json(enrichedMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new conversation and send email
export const createConversation = async (req, res) => {
  try {
    console.log('Creating conversation with data:', req.body);
    const { recipient, subject, message } = req.body;
    
    if (!recipient || !subject || !message) {
      return res.status(400).json({ message: 'Missing required fields: recipient, subject, or message' });
    }
    
    // Find or create user/lead
    let lead = await Lead.findOne({ email: recipient });
    let recipientName = recipient.split('@')[0];
    
    if (lead) {
      recipientName = lead.name;
    }
    
    // Get current user
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create conversation
    const conversation = new Conversation({
      participants: [
        {
          userId: currentUser._id,
          email: currentUser.email,
          name: currentUser.fullName || currentUser.username,
          role: 'admin'
        },
        {
          userId: lead?._id || null,
          email: recipient,
          name: recipientName,
          role: 'lead'
        }
      ],
      leadId: lead?._id || null,
      subject: subject,
      lastMessage: message.substring(0, 100),
      lastMessageAt: new Date(),
      unreadCount: 0
    });
    
    await conversation.save();
    console.log('Conversation created:', conversation._id);
    
    // Save the message
    const newMessage = new Message({
      conversationId: conversation._id,
      senderId: currentUser._id,
      senderEmail: currentUser.email,
      senderName: currentUser.fullName || currentUser.username,
      recipientEmail: recipient,
      recipientName: recipientName,
      subject: subject,
      text: message,
      direction: 'outgoing',
      emailSent: false
    });
    
    await newMessage.save();
    console.log('Message saved:', newMessage._id);
    
    // Send email via Nodemailer (if configured)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendEmail({
          to: recipient,
          subject: subject,
          text: message,
          from: `${currentUser.fullName || currentUser.username} <${process.env.EMAIL_USER}>`,
          conversationId: conversation._id,
          senderId: currentUser._id,
          recipientName: recipientName
        });
        
        newMessage.emailSent = true;
        await newMessage.save();
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log('Email not configured. Message saved locally only.');
    }
    
    res.status(201).json({
      message: 'Message sent successfully',
      conversation: {
        id: conversation._id,
        contact: {
          name: recipientName,
          email: recipient
        },
        subject: conversation.subject,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt
      }
    });
    
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send message in existing conversation
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    console.log('Sending message to conversation:', id);
    
    if (!text) {
      return res.status(400).json({ message: 'Message text is required' });
    }
    
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find recipient
    const recipient = conversation.participants.find(p => p.role === 'lead');
    if (!recipient) {
      return res.status(400).json({ message: 'No recipient found' });
    }
    
    // Save message
    const message = new Message({
      conversationId: conversation._id,
      senderId: currentUser._id,
      senderEmail: currentUser.email,
      senderName: currentUser.fullName || currentUser.username,
      recipientEmail: recipient.email,
      recipientName: recipient.name,
      subject: conversation.subject,
      text: text,
      direction: 'outgoing',
      emailSent: false
    });
    
    await message.save();
    
    // Update conversation
    conversation.lastMessage = text.substring(0, 100);
    conversation.lastMessageAt = new Date();
    await conversation.save();
    
    // Send email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendEmail({
          to: recipient.email,
          subject: conversation.subject,
          text: text,
          from: `${currentUser.fullName || currentUser.username} <${process.env.EMAIL_USER}>`,
          conversationId: conversation._id,
          senderId: currentUser._id,
          recipientName: recipient.name
        });
        
        message.emailSent = true;
        await message.save();
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }
    
    res.json({
      id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      direction: message.direction
    });
    
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle star message
export const toggleStar = async (req, res) => {
  try {
    const { id } = req.params;
    const { starred } = req.body;
    
    const message = await Message.findByIdAndUpdate(
      id,
      { isStarred: starred },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({ message: 'Message star toggled' });
  } catch (error) {
    console.error('Toggle star error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findByIdAndDelete(id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Star conversation
export const starConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { starred } = req.body;
    
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { starred: starred },
      { new: true }
    );
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    res.json({ message: 'Conversation star toggled' });
  } catch (error) {
    console.error('Star conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};