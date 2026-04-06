import Imap from 'imap';
import { simpleParser } from 'mailparser';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import { createNotification } from '../controllers/notificationController.js';

let imap = null;

// Setup IMAP connection for receiving emails
export const setupEmailReceiver = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
   
    return;
  }

  imap = new Imap({
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  });
  
  imap.once('ready', () => {
   
    openInbox();
  });
  
  imap.once('error', (err) => {
    console.error('IMAP error:', err);
  });
  
  imap.once('end', () => {
    
  });
  
  imap.connect();
};

const openInbox = () => {
  imap.openBox('INBOX', false, (err, box) => {
    if (err) throw err;
    
    
    // Search for unseen messages
    imap.search(['UNSEEN'], (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        processEmails(results);
      }
    });
    
    // Listen for new messages
    imap.on('mail', (numNewMsgs) => {
      
      imap.search(['UNSEEN'], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
          processEmails(results);
        }
      });
    });
  });
};

const processEmails = (results) => {
  const fetch = imap.fetch(results, { bodies: '' });
  
  fetch.on('message', (msg, seqno) => {
    let emailData = '';
    
    msg.on('body', (stream, info) => {
      let buffer = '';
      stream.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
      });
      stream.once('end', () => {
        emailData = buffer;
      });
    });
    
    msg.once('end', async () => {
      try {
        const parsed = await simpleParser(emailData);
        await processIncomingEmail(parsed);
      } catch (error) {
        console.error('Error parsing email:', error);
      }
    });
  });
  
  fetch.once('error', (err) => {
    console.error('Fetch error:', err);
  });
};

const processIncomingEmail = async (email) => {
  try {
    const from = email.from?.text;
    const fromEmail = email.from?.value[0]?.address;
    const subject = email.subject || 'No Subject';
    const text = email.text || email.html || '';
    const emailId = email.messageId;
    
   
    
    // IMPORTANT: Check if sender is a lead in our system
    const lead = await Lead.findOne({ email: fromEmail });
    
    if (!lead) {

      return;
    }
    
  
    
    // Get the admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
    
      return;
    }
    
    // Check if this email is from the system itself (avoid loops)
    if (fromEmail === process.env.EMAIL_USER) {
    
      return;
    }
    
    let conversationId = null;
    let conversation = null;
    
    // Method 1: Check custom header for conversation ID (from our sent emails)
    const convHeader = email.headers?.get('x-conversation-id');
    if (convHeader) {
      conversationId = convHeader;
      conversation = await Conversation.findById(conversationId);
      
    }
    
    // Method 2: Find conversation by lead email
    if (!conversation && lead) {
      conversation = await Conversation.findOne({
        leadId: lead._id
      });
      if (conversation) {
        conversationId = conversation._id;
       
      }
    }
    
    // Method 3: Find conversation by sender email
    if (!conversation && fromEmail) {
      conversation = await Conversation.findOne({
        'participants.email': fromEmail
      });
      if (conversation) {
        conversationId = conversation._id;
       
      }
    }
    
    // Method 4: Find conversation by subject
    if (!conversation && subject) {
      const cleanSubject = subject.replace(/^(Re:|Fwd:|RE:|FWD:)\s*/i, '').trim();
      conversation = await Conversation.findOne({
        subject: { $regex: new RegExp(`^${cleanSubject}$`, 'i') }
      });
      if (conversation) {
        conversationId = conversation._id;
       
      }
    }
    
    // If conversation exists, save the incoming message
    if (conversation && conversationId) {
     
      
      // Check for duplicate
      const existingMessage = await Message.findOne({ 
        emailId: emailId,
        conversationId: conversationId 
      });
      
      if (existingMessage) {
       
        return;
      }
      
      // Save incoming message from lead
      const message = new Message({
        conversationId: conversationId,
        senderId: null,
        senderEmail: fromEmail,
        senderName: lead.name || from || fromEmail.split('@')[0],
        recipientEmail: process.env.EMAIL_USER,
        recipientName: adminUser.fullName || adminUser.username,
        subject: subject,
        text: text.substring(0, 5000),
        direction: 'incoming',
        emailSent: true,
        emailId: emailId,
        isRead: false,
        userId: adminUser._id
      });
      
      await message.save();
     
      
      // Create notification for lead reply
      await createNotification(
        adminUser._id,
        'email',
        'Lead Reply Received',
        `${lead.name} replied to your message: "${subject}"`,
        conversationId,
        { from: fromEmail, leadName: lead.name, subject: subject }
      );
      
      // Update conversation
      conversation.lastMessage = text.substring(0, 100);
      conversation.lastMessageAt = new Date();
      conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      await conversation.save();
     
    } else {
      // Create a new conversation for this lead
      console.log(`📝 Creating new conversation for lead: ${lead.name}`);
      
      // Create new conversation
      const newConversation = new Conversation({
        participants: [
          {
            userId: adminUser._id,
            email: adminUser.email,
            name: adminUser.fullName || adminUser.username,
            role: 'admin'
          },
          {
            userId: lead._id,
            email: lead.email,
            name: lead.name,
            role: 'lead'
          }
        ],
        leadId: lead._id,
        subject: subject.replace(/^(Re:|Fwd:)\s*/i, '').trim(),
        lastMessage: text.substring(0, 100),
        lastMessageAt: new Date(),
        unreadCount: 1,
        userId: adminUser._id
      });
      
      await newConversation.save();
    
      
      // Save the message
      const message = new Message({
        conversationId: newConversation._id,
        senderId: null,
        senderEmail: fromEmail,
        senderName: lead.name,
        recipientEmail: process.env.EMAIL_USER,
        recipientName: adminUser.fullName || adminUser.username,
        subject: subject,
        text: text.substring(0, 5000),
        direction: 'incoming',
        emailSent: true,
        emailId: emailId,
        isRead: false,
        userId: adminUser._id
      });
      
      await message.save();
    
      
      // Create notification for new lead message
      await createNotification(
        adminUser._id,
        'email',
        'New Message from Lead',
        `${lead.name} sent you a message: "${subject}"`,
        newConversation._id,
        { from: fromEmail, leadName: lead.name, subject: subject }
      );
    }
    
  } catch (error) {
    console.error('Error processing incoming email:', error);
  }
};