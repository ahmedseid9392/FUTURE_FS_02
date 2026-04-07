import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  Phone, 
  BookOpen, 
  Video, 
  FileText, 
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  Send,
  CheckCircle,
ExternalLink,
Calendar,
  Clock,
 Zap,
  Shield,
  Users,
  BarChart3,
  MessageCircle,
  LifeBuoy,
  Book,
  Twitter,
  Facebook,
  Linkedin,
  Github
} from "lucide-react";

const HelpSupport = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("faq"); // faq, guides, support, feedback

  // FAQ Data
  const faqs = [
    {
      id: 1,
      category: "getting-started",
      question: "How do I get started with LeadCRM?",
      answer: "Getting started is easy! 1. Create your account, 2. Add your first lead, 3. Set up your dashboard preferences, 4. Start managing your leads. You can also watch our video tutorials in the Guides section."
    },
    {
      id: 2,
      category: "leads",
      question: "How do I add a new lead?",
      answer: "You can add a new lead by clicking the 'Add Lead' button on the Leads page. Fill in the lead's name, email, phone number, and source. You can also import leads via CSV file from the Settings page."
    },
    {
      id: 3,
      category: "leads",
      question: "How do I update lead status?",
      answer: "Lead status can be updated directly from the leads table by clicking on the status dropdown, or from the lead details page. Status options include: New, Contacted, and Converted."
    },
    {
      id: 4,
      category: "analytics",
      question: "How do I view my conversion rate?",
      answer: "Your conversion rate is displayed on the Dashboard and Analytics pages. It shows the percentage of leads that have been converted to clients. You can also filter by date range to see trends."
    },
    {
      id: 5,
      category: "calendar",
      question: "How do I schedule follow-ups?",
      answer: "Use the Calendar page to schedule meetings and follow-ups. Click on any date to create an event, set reminders, and associate it with specific leads. You'll receive notifications for upcoming events."
    },
    {
      id: 6,
      category: "messages",
      question: "Can I send emails from within the CRM?",
      answer: "Yes! Use the Messages page to send emails directly to your leads. All communication is tracked and stored in the conversation history for each lead."
    },
    {
      id: 7,
      category: "security",
      question: "Is my data secure?",
      answer: "Yes, we take security seriously. All data is encrypted, and we use JWT tokens for authentication. You can also enable two-factor authentication from your Profile Settings."
    },
    {
      id: 8,
      category: "billing",
      question: "What are the pricing plans?",
      answer: "LeadCRM offers flexible pricing plans. Contact our sales team for detailed pricing information tailored to your business needs."
    },
    {
      id: 9,
      category: "integration",
      question: "Can I integrate LeadCRM with other tools?",
      answer: "Yes, LeadCRM supports integrations with popular tools through our API. Contact support for integration assistance."
    },
    {
      id: 10,
      category: "support",
      question: "How do I get technical support?",
      answer: "You can reach our support team through the Support Ticket form below, email us at support@leadcrm.com, or call our helpline at +1 (555) 123-4567."
    }
  ];

  // Guide Data
  const guides = [
    {
      id: 1,
      title: "Getting Started with LeadCRM",
      description: "Learn the basics of managing your first leads",
      duration: "5 min",
      type: "video",
      icon: <Video className="w-5 h-5" />,
      link: "#"
    },
    {
      id: 2,
      title: "Lead Management Best Practices",
      description: "Tips for organizing and converting leads effectively",
      duration: "8 min",
      type: "article",
      icon: <BookOpen className="w-5 h-5" />,
      link: "#"
    },
    {
      id: 3,
      title: "Using Analytics for Better Decisions",
      description: "How to interpret your data and improve conversion rates",
      duration: "10 min",
      type: "video",
      icon: <BarChart3 className="w-5 h-5" />,
      link: "#"
    },
    {
      id: 4,
      title: "Email Automation Setup",
      description: "Configure automated follow-up emails",
      duration: "7 min",
      type: "article",
      icon: <Mail className="w-5 h-5" />,
      link: "#"
    },
    {
      id: 5,
      title: "Calendar Integration Guide",
      description: "Sync your calendar and schedule meetings",
      duration: "6 min",
      type: "video",
      icon: <Calendar className="w-5 h-5" />,
      link: "#"
    },
    {
      id: 6,
      title: "API Documentation",
      description: "Integrate LeadCRM with your existing tools",
      duration: "15 min",
      type: "documentation",
      icon: <FileText className="w-5 h-5" />,
      link: "#"
    }
  ];

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: "all", name: "All", icon: <HelpCircle className="w-4 h-4" /> },
    { id: "getting-started", name: "Getting Started", icon: <Zap className="w-4 h-4" /> },
    { id: "leads", name: "Leads", icon: <Users className="w-4 h-4" /> },
    { id: "analytics", name: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "calendar", name: "Calendar", icon: <Calendar className="w-4 h-4" /> },
    { id: "messages", name: "Messages", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "security", name: "Security", icon: <Shield className="w-4 h-4" /> },
    { id: "support", name: "Support", icon: <LifeBuoy className="w-4 h-4" /> }
  ];

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (feedback.trim() && feedbackRating > 0) {
      setFeedbackSubmitted(true);
      setTimeout(() => setFeedbackSubmitted(false), 3000);
      setFeedback("");
      setFeedbackRating(0);
    }
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (ticketSubject.trim() && ticketMessage.trim()) {
      setTicketSubmitted(true);
      setTimeout(() => setTicketSubmitted(false), 3000);
      setTicketSubject("");
      setTicketMessage("");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Find answers, guides, and get support for your LeadCRM account
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help articles, guides, or FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <LifeBuoy className="w-8 h-8 mb-2" />
            <p className="font-semibold">24/7 Support</p>
            <p className="text-sm opacity-90">Always here to help</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <Book className="w-8 h-8 mb-2" />
            <p className="font-semibold">Knowledge Base</p>
            <p className="text-sm opacity-90">50+ articles</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <Video className="w-8 h-8 mb-2" />
            <p className="font-semibold">Video Tutorials</p>
            <p className="text-sm opacity-90">Step-by-step guides</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <MessageCircle className="w-8 h-8 mb-2" />
            <p className="font-semibold">Live Chat</p>
            <p className="text-sm opacity-90">Response in minutes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("faq")}
              className={`pb-3 text-sm font-medium transition ${
                activeTab === "faq"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <HelpCircle className="w-4 h-4 inline mr-1" />
              FAQs
            </button>
            <button
              onClick={() => setActiveTab("guides")}
              className={`pb-3 text-sm font-medium transition ${
                activeTab === "guides"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-1" />
              Guides & Tutorials
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`pb-3 text-sm font-medium transition ${
                activeTab === "support"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Contact Support
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`pb-3 text-sm font-medium transition ${
                activeTab === "feedback"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Star className="w-4 h-4 inline mr-1" />
              Feedback
            </button>
          </nav>
        </div>

        {/* FAQs Tab */}
        {activeTab === "faq" && (
          <div>
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                    activeCategory === category.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>

            {/* FAQs List */}
            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No FAQs found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search or browse by category
                  </p>
                </div>
              ) : (
                filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                      className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <span className="font-medium text-gray-900 dark:text-white text-left">
                        {faq.question}
                      </span>
                      {openFaq === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {openFaq === faq.id && (
                      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                        {faq.category === "support" && (
                          <button className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            Contact Support →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Guides Tab */}
        {activeTab === "guides" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <div
                key={guide.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    guide.type === "video" ? "bg-blue-100 dark:bg-blue-900/30" :
                    guide.type === "article" ? "bg-green-100 dark:bg-green-900/30" :
                    "bg-purple-100 dark:bg-purple-900/30"
                  }`}>
                    {guide.icon}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {guide.duration}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{guide.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{guide.description}</p>
                <a
                  href={guide.link}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Guide
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Support Tab */}
        {activeTab === "support" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Methods */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <Mail className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Get response within 24 hours
                </p>
                <a href="mailto:support@leadcrm.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                  support@leadcrm.com
                </a>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <Phone className="w-8 h-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Phone Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Mon-Fri, 9am-6pm EST
                </p>
                <a href="tel:+15551234567" className="text-blue-600 dark:text-blue-400 hover:underline">
                  +251 (555) 123-456
                </a>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <MessageCircle className="w-8 h-8 text-purple-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Available 24/7 for urgent issues
                </p>
                <button className="text-blue-600 dark:text-blue-400 hover:underline">
                  Start Chat →
                </button>
              </div>
            </div>

            {/* Support Ticket Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Submit a Support Ticket
                </h2>
                {ticketSubmitted ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <p className="text-green-700 dark:text-green-400">Ticket submitted successfully! We'll get back to you soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTicket}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Brief description of your issue"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message
                      </label>
                      <textarea
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        rows="5"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Please provide details about your issue..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Send className="w-4 h-4" />
                      Submit Ticket
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === "feedback" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feedback Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Share Your Feedback
              </h2>
              {feedbackSubmitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-green-700 dark:text-green-400">Thank you for your feedback!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      How would you rate your experience?
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFeedbackRating(rating)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              rating <= feedbackRating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Feedback
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Tell us what you like or how we can improve..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={feedbackRating === 0}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>

            {/* Feature Requests */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Suggest a Feature
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Have an idea for a new feature? Let us know and help shape the future of LeadCRM.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                    <p className="text-xs text-gray-500">Already implemented ✓</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email Templates</p>
                    <p className="text-xs text-gray-500">In development</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Advanced Analytics</p>
                    <p className="text-xs text-gray-500">Coming soon</p>
                  </div>
                </div>
              </div>
              <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <MessageCircle className="w-4 h-4" />
                Suggest Feature
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HelpSupport;