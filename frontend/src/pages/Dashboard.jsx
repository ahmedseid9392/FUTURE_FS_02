import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import LeadForm from "../components/LeadForm";
import Layout from "../components/Layout";
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Edit, 
  ChevronDown,
  ChevronUp,
  Download,
  PlusCircle,
  AlertCircle,
  X,
  MessageSquare,
  Calendar,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [showStats, setShowStats] = useState(true);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await API.get("/leads");
      setLeads(res.data);
    } catch (error) {
      showNotification("Failed to fetch leads", "error");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const deleteLead = async (id) => {
    try {
      await API.delete(`/leads/${id}`);
      fetchLeads();
      showNotification("Lead deleted successfully", "success");
      setShowDeleteConfirm(null);
    } catch (error) {
      showNotification("Failed to delete lead", "error");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/leads/${id}`, { status });
      fetchLeads();
      showNotification(`Lead status updated to ${status}`, "success");
    } catch (error) {
      showNotification("Failed to update status", "error");
    }
  };

  // Filter leads based on search and status
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.source?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort leads
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc"
    });
  };

  // Statistics
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    converted: leads.filter(l => l.status === "converted").length,
    conversionRate: leads.length ? ((leads.filter(l => l.status === "converted").length / leads.length) * 100).toFixed(1) : 0
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "converted": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "new": return <Clock className="w-4 h-4" />;
      case "contacted": return <MessageSquare className="w-4 h-4" />;
      case "converted": return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronDown className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === "asc" ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Notification */}
        {notification.show && (
          <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === "error" ? "bg-red-500" : "bg-green-500"
          } text-white animate-slide-in`}>
            {notification.message}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage and track your leads effectively</p>
            </div>
            <button
              onClick={() => setShowLeadForm(!showLeadForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add New Lead</span>
            </button>
          </div>

          {/* Stats Cards */}
          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">New Leads</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Contacted</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Converted</p>
                    <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Conversion Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
          )}

          {/* Lead Form */}
          {showLeadForm && (
            <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Lead</h2>
                <button
                  onClick={() => setShowLeadForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <LeadForm fetchLeads={() => {
                fetchLeads();
                setShowLeadForm(false);
                showNotification("Lead added successfully", "success");
              }} />
            </div>
          )}

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads by name, email, or source..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                </select>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : sortedLeads.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                <p className="text-gray-500">Get started by adding your first lead</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        onClick={() => handleSort("name")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Name</span>
                          <SortIcon column="name" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th 
                        onClick={() => handleSort("source")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Source</span>
                          <SortIcon column="source" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort("status")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          <SortIcon column="status" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort("createdAt")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Created</span>
                          <SortIcon column="createdAt" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedLeads.map((lead) => (
                      <tr key={lead._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{lead.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{lead.email}</div>
                          {lead.phone && (
                            <div className="text-sm text-gray-500">{lead.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{lead.source || "Direct"}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <select
                              value={lead.status}
                              onChange={(e) => updateStatus(lead._id, e.target.value)}
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)} border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="converted">Converted</option>
                            </select>
                            {getStatusIcon(lead.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-3">
                            <Link
                              to={`/leads/${lead._id}`}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => setShowDeleteConfirm(lead._id)}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Results Count */}
          {!loading && sortedLeads.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {sortedLeads.length} of {leads.length} leads
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this lead? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => deleteLead(showDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </Layout>
  );
};

export default Dashboard;