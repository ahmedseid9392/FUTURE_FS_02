import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import Layout from "../components/Layout";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Tag, 
  MessageSquare,
  Trash2,
  CheckCircle,
  Clock,
  User,
  Edit2,
  Save,
  X
} from "lucide-react";

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: ""
  });

  // Fetch lead details - using the correct endpoint
  const fetchLeadDetails = async () => {
    try {
      // Your leads endpoint might be just /leads and then filter on frontend
      // or you might have a specific endpoint. Let's try both approaches
      const res = await API.get("/leads");
      const foundLead = res.data.find(lead => lead._id === id);
      if (foundLead) {
        setLead(foundLead);
        setEditForm({
          name: foundLead.name,
          email: foundLead.email,
          phone: foundLead.phone || "",
          source: foundLead.source || ""
        });
      } else {
        setError("Lead not found");
      }
    } catch (err) {
      console.error("Failed to fetch lead details", err);
      setError("Failed to load lead details");
    }
  };

  // Fetch notes for this lead
  const fetchNotes = async () => {
    try {
      // If you have a notes endpoint, use it
      const res = await API.get(`/notes?leadId=${id}`);
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes", err);
      // If notes endpoint doesn't exist, set empty array
      setNotes([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchLeadDetails();
      await fetchNotes();
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const addNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      // If you have a notes endpoint
      await API.post(`/notes`, { leadId: id, text: noteText });
      setNoteText("");
      fetchNotes();
    } catch (err) {
      console.error("Failed to add note", err);
      // If notes API doesn't exist, show message
      alert("Notes feature coming soon!");
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await API.put(`/leads/${id}`, { status: newStatus });
      setLead({ ...lead, status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Could not update status");
    } finally {
      setUpdating(false);
    }
  };

  const updateLeadDetails = async () => {
    setUpdating(true);
    try {
      await API.put(`/leads/${id}`, editForm);
      setLead({ ...lead, ...editForm });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update lead", err);
      alert("Could not update lead details");
    } finally {
      setUpdating(false);
    }
  };

  const deleteLead = async () => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await API.delete(`/leads/${id}`);
      navigate("/leads");
    } catch (err) {
      console.error("Failed to delete lead", err);
      alert("Could not delete lead");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "new": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "contacted": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "converted": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
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

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !lead) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || "Lead not found"}</p>
          <button
            onClick={() => navigate("/leads")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Back to Leads
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/leads")}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Leads
        </button>
        <div className="flex space-x-2">
          <button
            onClick={deleteLead}
            className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </button>
        </div>
      </div>

      {/* Lead Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="text-2xl font-bold bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none dark:text-white"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lead.name}</h1>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {getStatusIcon(lead.status)}
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                    {lead.source && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                        <Tag className="w-3 h-3" />
                        {lead.source}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={updateLeadDetails}
                    disabled={updating}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </button>
              )}
              
              <select
                value={lead.status}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={updating}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
              </select>
              {updating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <a href={`mailto:${lead.email}`} className="text-gray-900 dark:text-white hover:text-blue-600">
                    {lead.email}
                  </a>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Not provided"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{lead.phone || "Not provided"}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Source</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.source}
                    onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="How did they find us?"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{lead.source || "Not specified"}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Lead Created</p>
                <p className="text-gray-900 dark:text-white">
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Follow-up Notes
          </h2>

          {/* Add Note Form */}
          <form onSubmit={addNote} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a follow-up note..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Note
              </button>
            </div>
          </form>

          {/* Notes Timeline */}
          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No notes yet. Add a follow-up note to track your communication.
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700"
                >
                  <p className="text-gray-800 dark:text-gray-200 mb-2">{note.text}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      {note.createdBy || "Admin"}
                    </span>
                    <span>
                      {note.createdAt ? new Date(note.createdAt).toLocaleString() : "Just now"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LeadDetails;