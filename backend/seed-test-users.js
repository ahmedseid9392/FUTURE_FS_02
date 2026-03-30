import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Lead from './models/Lead.js';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';
import Event from './models/Event.js';
import Notification from './models/Notification.js';

dotenv.config();

// Test Users Data
const testUsers = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'John@123',
    fullName: 'John Doe',
    role: 'user',
    avatar: null
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'Jane@123',
    fullName: 'Jane Smith',
    role: 'user',
    avatar: null
  }
];

// John's Leads
const johnLeads = [
  {
    name: 'Alice Brown',
    email: 'alice@tech.com',
    phone: '+1 234-567-8901',
    source: 'Website',
    status: 'new',
    notes: [
      {
        text: 'Interested in enterprise plan. Follow up next week.',
        createdBy: 'john@example.com',
        createdAt: new Date('2024-03-25')
      }
    ],
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-25')
  },
  {
    name: 'Bob Wilson',
    email: 'bob@startup.io',
    phone: '+1 234-567-8902',
    source: 'Referral',
    status: 'contacted',
    notes: [
      {
        text: 'Referred by Sarah. Sent proposal on March 22.',
        createdBy: 'john@example.com',
        createdAt: new Date('2024-03-22')
      }
    ],
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date('2024-03-22')
  },
  {
    name: 'Carol Davis',
    email: 'carol@design.com',
    phone: '+1 234-567-8903',
    source: 'LinkedIn',
    status: 'converted',
    notes: [
      {
        text: 'Signed contract on March 20!',
        createdBy: 'john@example.com',
        createdAt: new Date('2024-03-20')
      }
    ],
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-20')
  }
];

// Jane's Leads
const janeLeads = [
  {
    name: 'David Miller',
    email: 'david@marketingpro.com',
    phone: '+1 234-567-8904',
    source: 'Twitter',
    status: 'new',
    notes: [],
    createdAt: new Date('2024-03-22'),
    updatedAt: new Date('2024-03-22')
  },
  {
    name: 'Emma Watson',
    email: 'emma@ecommerce.com',
    phone: '+1 234-567-8905',
    source: 'Google Ads',
    status: 'contacted',
    notes: [
      {
        text: 'Interested in demo. Scheduled for March 28.',
        createdBy: 'jane@example.com',
        createdAt: new Date('2024-03-24')
      }
    ],
    createdAt: new Date('2024-03-19'),
    updatedAt: new Date('2024-03-24')
  },
  {
    name: 'Frank Thomas',
    email: 'frank@consulting.com',
    phone: '+1 234-567-8906',
    source: 'Email Campaign',
    status: 'converted',
    notes: [
      {
        text: 'Signed up for premium plan!',
        createdBy: 'jane@example.com',
        createdAt: new Date('2024-03-21')
      }
    ],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-21')
  }
];

// John's Messages
const johnMessages = [
  {
    subject: 'Introduction to LeadCRM',
    text: 'Hi Alice, thanks for your interest! I\'d love to schedule a demo to show you how LeadCRM can help your business.',
    recipientEmail: 'alice@tech.com',
    recipientName: 'Alice Brown',
    direction: 'outgoing',
    createdAt: new Date('2024-03-21')
  },
  {
    subject: 'Re: Proposal Review',
    text: 'Bob, following up on the proposal I sent. Let me know if you have any questions!',
    recipientEmail: 'bob@startup.io',
    recipientName: 'Bob Wilson',
    direction: 'outgoing',
    createdAt: new Date('2024-03-23')
  }
];

// Jane's Messages
const janeMessages = [
  {
    subject: 'Demo Confirmation',
    text: 'Hi Emma, confirming our demo for March 28 at 2 PM EST. Looking forward to meeting you!',
    recipientEmail: 'emma@ecommerce.com',
    recipientName: 'Emma Watson',
    direction: 'outgoing',
    createdAt: new Date('2024-03-24')
  },
  {
    subject: 'Welcome to LeadCRM!',
    text: 'Frank, welcome aboard! Your premium plan is now active. Let me know if you need any assistance.',
    recipientEmail: 'frank@consulting.com',
    recipientName: 'Frank Thomas',
    direction: 'outgoing',
    createdAt: new Date('2024-03-21')
  }
];

// John's Calendar Events
const johnEvents = [
  {
    title: 'Demo with Alice Brown',
    description: 'Show LeadCRM features to Alice',
    type: 'video',
    startDate: new Date('2024-03-28T14:00:00'),
    endDate: new Date('2024-03-28T15:00:00'),
    location: 'Zoom Meeting',
    attendees: ['alice@tech.com'],
    reminder: 30,
    color: 'blue',
    createdAt: new Date('2024-03-25')
  },
  {
    title: 'Follow-up call with Bob',
    description: 'Discuss proposal details',
    type: 'call',
    startDate: new Date('2024-03-26T10:00:00'),
    endDate: new Date('2024-03-26T10:30:00'),
    location: 'Phone',
    attendees: ['bob@startup.io'],
    reminder: 15,
    color: 'green',
    createdAt: new Date('2024-03-24')
  }
];

// Jane's Calendar Events
const janeEvents = [
  {
    title: 'Demo with Emma Watson',
    description: 'Product demonstration for Emma',
    type: 'video',
    startDate: new Date('2024-03-28T14:00:00'),
    endDate: new Date('2024-03-28T15:00:00'),
    location: 'Google Meet',
    attendees: ['emma@ecommerce.com'],
    reminder: 30,
    color: 'purple',
    createdAt: new Date('2024-03-25')
  },
  {
    title: 'Weekly Sales Review',
    description: 'Team meeting to discuss progress',
    type: 'meeting',
    startDate: new Date('2024-03-27T09:00:00'),
    endDate: new Date('2024-03-27T10:00:00'),
    location: 'Conference Room',
    attendees: ['team@leadcrm.com'],
    reminder: 15,
    color: 'yellow',
    createdAt: new Date('2024-03-23')
  }
];

// John's Notifications
const johnNotifications = [
  {
    type: 'lead',
    title: 'New Lead Added',
    message: 'Alice Brown submitted a contact form',
    read: false,
    createdAt: new Date('2024-03-20')
  },
  {
    type: 'message',
    title: 'Message Sent',
    message: 'Your message to Bob Wilson was delivered',
    read: true,
    createdAt: new Date('2024-03-23')
  },
  {
    type: 'calendar',
    title: 'Upcoming Event',
    message: 'Demo with Alice Brown in 1 hour',
    read: false,
    createdAt: new Date('2024-03-28T13:00:00')
  }
];

// Jane's Notifications
const janeNotifications = [
  {
    type: 'lead',
    title: 'New Lead Added',
    message: 'David Miller from Twitter wants to connect',
    read: false,
    createdAt: new Date('2024-03-22')
  },
  {
    type: 'conversion',
    title: 'Lead Converted!',
    message: 'Frank Thomas converted to client',
    read: false,
    createdAt: new Date('2024-03-21')
  },
  {
    type: 'calendar',
    title: 'Demo Reminder',
    message: 'Demo with Emma Watson tomorrow at 2 PM',
    read: false,
    createdAt: new Date('2024-03-27T10:00:00')
  }
];

// Helper function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Create test data for a user
const createUserData = async (userData, leadsData, messagesData, eventsData, notificationsData) => {
  // Create user
  const hashedPassword = await hashPassword(userData.password);
  const user = new User({
    ...userData,
    password: hashedPassword
  });
  await user.save();
  console.log(`✅ Created user: ${user.email}`);

  // Create leads
  for (const leadData of leadsData) {
    const lead = new Lead({
      ...leadData,
      userId: user._id
    });
    await lead.save();
  }
  console.log(`   Created ${leadsData.length} leads`);

  // Create messages and conversations
  for (const msgData of messagesData) {
    const conversationId = `conv_${user._id}_${Date.now()}_${Math.random()}`;
    
    const conversation = new Conversation({
      conversationId: conversationId,
      participants: [
        {
          userId: user._id,
          email: user.email,
          name: user.fullName,
          role: 'admin'
        },
        {
          email: msgData.recipientEmail,
          name: msgData.recipientName,
          role: 'lead'
        }
      ],
      subject: msgData.subject,
      lastMessage: msgData.text.substring(0, 100),
      lastMessageAt: msgData.createdAt,
      unreadCount: 0,
      userId: user._id
    });
    await conversation.save();

    const message = new Message({
      conversationId: conversationId,
      senderId: user._id,
      senderEmail: user.email,
      senderName: user.fullName,
      recipientEmail: msgData.recipientEmail,
      recipientName: msgData.recipientName,
      subject: msgData.subject,
      text: msgData.text,
      direction: msgData.direction,
      emailSent: true,
      userId: user._id,
      createdAt: msgData.createdAt
    });
    await message.save();
  }
  console.log(`   Created ${messagesData.length} messages`);

  // Create events
  for (const eventData of eventsData) {
    const event = new Event({
      ...eventData,
      userId: user._id
    });
    await event.save();
  }
  console.log(`   Created ${eventsData.length} events`);

  // Create notifications
  for (const notifData of notificationsData) {
    const notification = new Notification({
      ...notifData,
      userId: user._id
    });
    await notification.save();
  }
  console.log(`   Created ${notificationsData.length} notifications`);

  return user;
};

// Main seed function
const seedTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crm_db');
    console.log('✅ Connected to MongoDB\n');

    // Clear existing test data
    console.log('Clearing existing test data...');
    await User.deleteMany({ email: { $in: ['john@example.com', 'jane@example.com'] } });
    console.log('✅ Cleared existing test users\n');

    console.log('Creating test data for two users...\n');
    console.log('=' .repeat(50));

    // Create John's data
    console.log('\n📊 Creating John Doe\'s data:');
    const john = await createUserData(
      testUsers[0],
      johnLeads,
      johnMessages,
      johnEvents,
      johnNotifications
    );

    console.log('\n' + '='.repeat(50));

    // Create Jane's data
    console.log('\n📊 Creating Jane Smith\'s data:');
    const jane = await createUserData(
      testUsers[1],
      janeLeads,
      janeMessages,
      janeEvents,
      janeNotifications
    );

    console.log('\n' + '='.repeat(50));
    console.log('\n🎉 Test data created successfully!\n');

    // Display summary
    console.log('📋 SUMMARY:');
    console.log('='.repeat(50));
    console.log(`\n👤 User 1: ${john.fullName} (${john.email})`);
    console.log(`   Password: John@123`);
    console.log(`   Leads: ${johnLeads.length}`);
    console.log(`   Messages: ${johnMessages.length}`);
    console.log(`   Events: ${johnEvents.length}`);
    console.log(`   Notifications: ${johnNotifications.length}`);
    
    console.log(`\n👤 User 2: ${jane.fullName} (${jane.email})`);
    console.log(`   Password: Jane@123`);
    console.log(`   Leads: ${janeLeads.length}`);
    console.log(`   Messages: ${janeMessages.length}`);
    console.log(`   Events: ${janeEvents.length}`);
    console.log(`   Notifications: ${janeNotifications.length}`);

    console.log('\n✅ Each user has their own isolated data!');
    console.log('🔐 Users cannot see each other\'s data.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  }
};

seedTestData();