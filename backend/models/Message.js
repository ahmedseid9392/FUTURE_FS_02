import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,  
    default: null
  },
  senderEmail: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    default: ''
  },
  recipientEmail: {
    type: String,
    required: true
  },
  recipientName: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailId: {
    type: String,
    default: null
  },
  direction: {
    type: String,
    enum: ['outgoing', 'incoming'],
    default: 'outgoing'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;