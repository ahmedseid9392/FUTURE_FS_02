import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import API from "../services/api";
import { 
  Send, 
  Search, 
  User, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle, 
  MessageSquare,
  Plus,
  X,
  Eye,
  Trash2,
  Reply,
  Star,
  StarOff,
  Paperclip,
  Smile,
  MoreVertical,
  ChevronDown,
  Filter
} from "lucide-react";

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const messagesEndRef = useRef(null);
  const [newMessageForm, setNewMessageForm] = useState({
    to: "",
    subject: "",
    message: ""
  });
  const [conversationStarred, setConversationStarred] = useState(false);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await API.get("/messages/conversations");
      setConversations(res.data);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    try {
      const res = await API.get(`/messages/${conversationId}`);
     
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchConversations();
      setLoading(false);
    };
    loadData();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    setSending(true);
    try {
      await API.post(`/messages/${selectedConversation.id}`, {
        text: messageText
      });
      setMessageText("");
      await fetchMessages(selectedConversation.id);
      await fetchConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Create new conversation
  const createConversation = async (e) => {
    e.preventDefault();
    if (!newMessageForm.to.trim() || !newMessageForm.message.trim()) return;

    setSending(true);
    try {
      await API.post("/messages", {
        recipient: newMessageForm.to,
        subject: newMessageForm.subject,
        message: newMessageForm.message
      });
      setShowNewMessageModal(false);
      setNewMessageForm({ to: "", subject: "", message: "" });
      await fetchConversations();
    } catch (error) {
      console.error("Failed to create conversation:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Mark message as read
  const markAsRead = async (messageId) => {
    if (!messageId) {
      console.error("Cannot mark as read: messageId is undefined");
      return;
    }
    try {
      await API.put(`/messages/${messageId}/read`);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId || msg._id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Delete message - FIXED
  const deleteMessage = async (messageId) => {
    if (!messageId) {
      console.error("Cannot delete: messageId is undefined");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    
    try {
      await API.delete(`/messages/${messageId}`);
      // Refresh messages after deletion
      if (selectedConversation) {
        await fetchMessages(selectedConversation.id);
      }
      await fetchConversations();
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message");
    }
  };

  // Star/Unstar message
  const toggleMessageStar = async (messageId, isStarred) => {
    if (!messageId) {
      console.error("Cannot toggle star: messageId is undefined");
      return;
    }
    try {
      await API.put(`/messages/${messageId}/star`, { starred: !isStarred });
      setMessages(prev => 
        prev.map(msg => 
          (msg.id === messageId || msg._id === messageId) ? { ...msg, isStarred: !isStarred } : msg
        )
      );
    } catch (error) {
      console.error("Failed to toggle star:", error);
    }
  };

  // Star/Unstar conversation
  const toggleConversationStar = async (conversationId, isStarred) => {
    try {
      await API.put(`/messages/conversation/${conversationId}/star`, { starred: !isStarred });
      setConversationStarred(!isStarred);
      await fetchConversations();
    } catch (error) {
      console.error("Failed to toggle conversation star:", error);
    }
  };

  // Get message ID (handles both id and _id)
  const getMessageId = (msg) => {
    return msg.id || msg._id;
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === "all" || 
                         (filter === "unread" && conv.unreadCount > 0) ||
                         (filter === "starred" && conv.starred);
    
    return matchesSearch && matchesFilter;
  });

  // Format time
  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 48) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  // Get initials
  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Communicate with your leads and team members
            </p>
          </div>
          <button
            onClick={() => setShowNewMessageModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            New Message
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`flex-1 px-3 py-1 rounded-lg text-sm transition ${
                    filter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`flex-1 px-3 py-1 rounded-lg text-sm transition ${
                    filter === "unread"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilter("starred")}
                  className={`flex-1 px-3 py-1 rounded-lg text-sm transition ${
                    filter === "starred"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  Starred
                </button>
              </div>
            </div>

            {/* Conversations List */}
            <div className="overflow-y-auto h-[calc(100vh-280px)]">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No conversations</p>
                  <button
                    onClick={() => setShowNewMessageModal(true)}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Start a new conversation
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      setConversationStarred(conv.starred);
                      fetchMessages(conv.id);
                    }}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedConversation?.id === conv.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-medium">
                              {getInitials(conv.contact?.name || conv.contact?.email)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {conv.contact?.name || conv.contact?.email}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(conv.lastMessageAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {conv.subject}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                              {conv.lastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        {conv.starred && (
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        )}
                        {conv.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-600 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
            {!selectedConversation ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No conversation selected
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Choose a conversation from the list or start a new message
                </p>
                <button
                  onClick={() => setShowNewMessageModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  New Message
                </button>
              </div>
            ) : (
              <>
                {/* Conversation Header with Star Button */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {getInitials(selectedConversation.contact?.name || selectedConversation.contact?.email)}
                        </span>
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                          {selectedConversation.contact?.name || selectedConversation.contact?.email}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedConversation.subject}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleConversationStar(selectedConversation.id, conversationStarred)}
                        className="p-2 text-gray-500 hover:text-yellow-500 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title={conversationStarred ? "Remove from starred" : "Star conversation"}
                      >
                        {conversationStarred ? (
                          <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                        ) : (
                          <StarOff className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages List with Star and Delete on Each Message */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
                      <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const messageId = getMessageId(msg);
                      return (
                        <div
                          key={messageId}
                          className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'} group`}
                        >
                          <div className={`max-w-[70%] ${msg.direction === 'outgoing' ? 'order-2' : 'order-1'}`}>
                            <div className={`rounded-lg p-3 ${
                              msg.direction === 'outgoing'
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            }`}>
                              {msg.direction === 'incoming' && (
                                <p className="text-xs opacity-75 mb-1">
                                  {msg.senderName || msg.senderEmail}
                                </p>
                              )}
                              <p className="text-sm">{msg.text}</p>
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTime(msg.createdAt)}
                                </span>
                                {msg.isRead && msg.direction === 'outgoing' && (
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                )}
                              </div>
                              {/* Message Action Buttons */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => toggleMessageStar(messageId, msg.isStarred)}
                                  className="p-1 text-gray-400 hover:text-yellow-500 transition rounded"
                                  title={msg.isStarred ? "Remove star" : "Star message"}
                                >
                                  {msg.isStarred ? (
                                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                  ) : (
                                    <StarOff className="w-3 h-3" />
                                  )}
                                </button>
                                <button
                                  onClick={() => deleteMessage(messageId)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition rounded"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                {msg.direction === 'incoming' && !msg.isRead && (
                                  <button
                                    onClick={() => markAsRead(messageId)}
                                    className="p-1 text-blue-500 hover:text-blue-600 transition rounded text-xs"
                                    title="Mark as read"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Message</h2>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createConversation} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To
                </label>
                <input
                  type="email"
                  value={newMessageForm.to}
                  onChange={(e) => setNewMessageForm({ ...newMessageForm, to: e.target.value })}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={newMessageForm.subject}
                  onChange={(e) => setNewMessageForm({ ...newMessageForm, subject: e.target.value })}
                  placeholder="Enter subject"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={newMessageForm.message}
                  onChange={(e) => setNewMessageForm({ ...newMessageForm, message: e.target.value })}
                  rows="5"
                  placeholder="Type your message..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewMessageModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Messages;