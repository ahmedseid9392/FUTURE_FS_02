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
      userId: req.user.id // Only get conversations for this user
    }).sort({ lastMessageAt: -1 }).limit(50);
    
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
    
    // First verify the conversation belongs to this user
    const conversation = await Conversation.findOne({ 
      _id: id,
      userId: req.user.id
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    const messages = await Message.find({ 
      conversationId: id,
      userId: req.user.id // Only get messages for this user
    }).sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { conversationId: id, isRead: false, direction: 'incoming', userId: req.user.id },
      { $set: { isRead: true } }
    );
    
    // Reset unread count
    await Conversation.findByIdAndUpdate(id, { unreadCount: 0 });
    
    res.json(messages);
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
      return res.status(400).json({ message: 'Missing required fields' });
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
    
    // Create conversation with user association
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
      unreadCount: 0,
      userId: currentUser._id // Associate with current user
    });
    
    await conversation.save();
    console.log('Conversation created:', conversation._id);
    
    // Save the message with user association
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
      emailSent: false,
      userId: currentUser._id // Associate with current user
    });
    
    await newMessage.save();
    
    // Send email if configured
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
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
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
    
    const conversation = await Conversation.findOne({ 
      _id: id,
      userId: req.user.id // Verify ownership
    });
    
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
    
    // Save message with user association
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
      emailSent: false,
      userId: currentUser._id // Associate with current user
    });
    
    await message.save();
    
    // Update conversation
    conversation.lastMessage = text.substring(0, 100);
    conversation.lastMessageAt = new Date();
    await conversation.save();
    
    // Send email if configured
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
    
    const message = await Message.findOneAndUpdate(
      { _id: id, userId: req.user.id }, // Check ownership
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
    
    const message = await Message.findOneAndUpdate(
      { _id: id, userId: req.user.id }, // Check ownership
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
    
    const message = await Message.findOneAndDelete({ 
      _id: id, 
      userId: req.user.id // Check ownership
    });
    
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
    
    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId: req.user.id }, // Check ownership
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