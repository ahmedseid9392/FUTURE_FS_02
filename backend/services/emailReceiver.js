import Imap from 'imap';
import { simpleParser } from 'mailparser';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

let imap = null;

// Setup IMAP connection for receiving emails
export const setupEmailReceiver = () => {
  imap = new Imap({
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  });
  
  imap.once('ready', () => {
    console.log('✅ IMAP ready for receiving emails');
    openInbox();
  });
  
  imap.once('error', (err) => {
    console.error('IMAP error:', err);
  });
  
  imap.once('end', () => {
    console.log('IMAP connection ended');
  });
  
  imap.connect();
};

const openInbox = () => {
  imap.openBox('INBOX', false, (err, box) => {
    if (err) throw err;
    console.log('✅ Monitoring inbox for replies');
    
    // Search for unseen messages
    imap.search(['UNSEEN'], (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        processEmails(results);
      }
    });
    
    // Listen for new messages
    imap.on('mail', (numNewMsgs) => {
      console.log(`📧 ${numNewMsgs} new email(s) received`);
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
    const subject = email.subject;
    const text = email.text || email.html || '';
    
    // Extract conversation ID from headers or subject
    let conversationId = null;
    
    // Check custom header
    if (email.headers.get('x-conversation-id')) {
      conversationId = email.headers.get('x-conversation-id');
    }
    
    // If no conversation ID, try to find by email and subject
    if (!conversationId && fromEmail) {
      const existingConversation = await Conversation.findOne({
        'participants.email': fromEmail,
        subject: { $regex: new RegExp(subject.replace(/^(Re:|Fwd:)/i, '').trim(), 'i') }
      });
      
      if (existingConversation) {
        conversationId = existingConversation._id.toString();
      }
    }
    
    if (conversationId) {
      // Find existing conversation
      const conversation = await Conversation.findById(conversationId);
      
      if (conversation) {
        // Find admin user
        const adminUser = await User.findOne({ role: 'admin' });
        
        // Save incoming message
        const message = new Message({
          conversationId: conversation._id,
          senderId: adminUser?._id || null,
          senderEmail: fromEmail,
          senderName: from,
          recipientEmail: process.env.EMAIL_USER,
          recipientName: 'LeadCRM',
          subject: subject,
          text: text,
          direction: 'incoming',
          emailSent: true,
          emailId: email.messageId
        });
        
        await message.save();
        
        // Update conversation
        conversation.lastMessage = text.substring(0, 100);
        conversation.lastMessageAt = new Date();
        conversation.unreadCount += 1;
        await conversation.save();
        
        console.log(`✅ Reply saved for conversation: ${conversation._id}`);
      }
    }
  } catch (error) {
    console.error('Error processing incoming email:', error);
  }
};