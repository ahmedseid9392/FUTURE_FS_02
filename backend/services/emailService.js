import nodemailer from 'nodemailer';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

// Configure email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // App password
    }
  });
};

// Send email
export const sendEmail = async ({ to, subject, text, from, conversationId, senderId, recipientName }) => {
  try {
    const transporter = createTransporter();
    
    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px 20px;
          }
          .message-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .message-text {
            font-size: 16px;
            line-height: 1.6;
            margin: 10px 0;
          }
          .details {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .detail-item {
            margin: 8px 0;
            font-size: 14px;
          }
          .detail-label {
            font-weight: 600;
            color: #555;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 15px;
          }
          .reply-hint {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 12px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LeadCRM Message</h1>
          </div>
          
          <div class="content">
            <p>Hello <strong>${recipientName || 'there'}</strong>,</p>
            
            <div class="message-box">
              <div class="message-text">
                ${text.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div class="details">
              <div class="detail-item">
                <span class="detail-label">From:</span> ${from || 'LeadCRM System'}
              </div>
              <div class="detail-item">
                <span class="detail-label">Subject:</span> ${subject}
              </div>
              <div class="detail-item">
                <span class="detail-label">Date:</span> ${new Date().toLocaleString()}
              </div>
            </div>
            
            <div class="reply-hint">
              💡 <strong>Reply directly to this email</strong> to continue the conversation. 
              Your reply will automatically appear in your LeadCRM dashboard.
            </div>
          </div>
          
          <div class="footer">
            <p>This message was sent from LeadCRM - Client Management System</p>
            <p>© ${new Date().getFullYear()} LeadCRM. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const mailOptions = {
      from: `"LeadCRM" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text, // Plain text version
      html: emailHtml,
      headers: {
        'X-Conversation-ID': conversationId,
        'X-Sender-ID': senderId
      }
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Generate conversation ID
export const generateConversationId = () => {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};