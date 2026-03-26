import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import API from "../services/api";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  MessageSquare,
  Phone,
  Video,
  MapPin,
  X,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Repeat,
  Bell,
  Mail,
  Filter,
  Download,
  ChevronDown,
  List,
  Grid,
  Sun,
  Moon
} from "lucide-react";

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // month, week, day, agenda
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filter, setFilter] = useState("all"); // all, meetings, calls, tasks, followups
  const [showFilters, setShowFilters] = useState(false);
  
  // Event Form State
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    type: "meeting",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "10:00",
    location: "",
    attendees: [],
    leadId: "",
    reminder: 15,
    recurrence: "none",
    color: "blue"
  });
  
  const [leads, setLeads] = useState([]);
  const [attendeesList, setAttendeesList] = useState("");

  // Colors for events
  const eventColors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    indigo: "bg-indigo-500"
  };

  // Fetch events
  useEffect(() => {
    fetchEvents();
    fetchLeads();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const res = await API.get(`/calendar/events?year=${year}&month=${month}`);
      setEvents(res.data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await API.get("/leads");
      setLeads(res.data);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    }
  };

  // Navigation
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "month") newDate.setMonth(currentDate.getMonth() - 1);
    else if (view === "week") newDate.setDate(currentDate.getDate() - 7);
    else newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === "month") newDate.setMonth(currentDate.getMonth() + 1);
    else if (view === "week") newDate.setDate(currentDate.getDate() + 7);
    else newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        events: []
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        events: []
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        events: []
      });
    }
    
    // Add events to days
    days.forEach(day => {
      day.events = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === day.date.toDateString();
      });
    });
    
    return days;
  };

  // Get week days
  const getWeekDays = () => {
    const weekDays = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push({
        date,
        events: events.filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate.toDateString() === date.toDateString();
        })
      });
    }
    return weekDays;
  };

  // Get hours for day view
  const getHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push({
        hour: i,
        label: i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`
      });
    }
    return hours;
  };

  // Create/Update Event
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${eventForm.startDate}T${eventForm.startTime}`);
    const endDateTime = new Date(`${eventForm.endDate}T${eventForm.endTime}`);
    
    const eventData = {
      ...eventForm,
      startDate: startDateTime,
      endDate: endDateTime,
      attendees: attendeesList.split(",").map(a => a.trim()).filter(a => a)
    };
    
    try {
      if (selectedEvent) {
        await API.put(`/calendar/events/${selectedEvent._id}`, eventData);
      } else {
        await API.post("/calendar/events", eventData);
      }
      setShowEventModal(false);
      setSelectedEvent(null);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error("Failed to save event:", error);
      alert("Failed to save event");
    }
  };

  // Delete Event
  const handleDeleteEvent = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    try {
      await API.delete(`/calendar/events/${selectedEvent._id}`);
      setShowEventModal(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event");
    }
  };

  const resetForm = () => {
    setEventForm({
      title: "",
      description: "",
      type: "meeting",
      startDate: "",
      startTime: "09:00",
      endDate: "",
      endTime: "10:00",
      location: "",
      attendees: [],
      leadId: "",
      reminder: 15,
      recurrence: "none",
      color: "blue"
    });
    setAttendeesList("");
  };

  const openEventModal = (event = null, date = null) => {
    if (event) {
      setSelectedEvent(event);
      setEventForm({
        title: event.title,
        description: event.description || "",
        type: event.type,
        startDate: new Date(event.startDate).toISOString().split("T")[0],
        startTime: new Date(event.startDate).toTimeString().slice(0, 5),
        endDate: new Date(event.endDate).toISOString().split("T")[0],
        endTime: new Date(event.endDate).toTimeString().slice(0, 5),
        location: event.location || "",
        attendees: event.attendees || [],
        leadId: event.leadId || "",
        reminder: event.reminder || 15,
        recurrence: event.recurrence || "none",
        color: event.color || "blue"
      });
      setAttendeesList((event.attendees || []).join(", "));
    } else {
      setSelectedEvent(null);
      const now = new Date();
      const formattedDate = date ? new Date(date).toISOString().split("T")[0] : now.toISOString().split("T")[0];
      setEventForm({
        ...eventForm,
        startDate: formattedDate,
        endDate: formattedDate
      });
      setAttendeesList("");
    }
    setShowEventModal(true);
  };

  const getEventTypeIcon = (type) => {
    switch(type) {
      case "meeting": return <Users className="w-3 h-3" />;
      case "call": return <Phone className="w-3 h-3" />;
      case "video": return <Video className="w-3 h-3" />;
      case "followup": return <MessageSquare className="w-3 h-3" />;
      default: return <CalendarIcon className="w-3 h-3" />;
    }
  };

  const getEventTypeColor = (type) => {
    switch(type) {
      case "meeting": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "call": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "video": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "followup": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredEvents = (eventsList) => {
    if (filter === "all") return eventsList;
    return eventsList.filter(event => event.type === filter);
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = getWeekDays();
  const hours = getHours();

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Schedule and manage your meetings, calls, and follow-ups
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button
              onClick={() => openEventModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        {showFilters && (
          <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setFilter("meeting")}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  filter === "meeting"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                Meetings
              </button>
              <button
                onClick={() => setFilter("call")}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  filter === "call"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                Calls
              </button>
              <button
                onClick={() => setFilter("video")}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  filter === "video"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                Video Calls
              </button>
              <button
                onClick={() => setFilter("followup")}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  filter === "followup"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                Follow-ups
              </button>
            </div>
          </div>
        )}

        {/* Calendar Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Today
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => setView("month")}
              className={`px-4 py-2 rounded-lg transition ${
                view === "month"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-2 rounded-lg transition ${
                view === "week"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("day")}
              className={`px-4 py-2 rounded-lg transition ${
                view === "day"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Day
            </button>
          </div>
        </div>

        {/* Month View */}
        {view === "month" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-fr">
              {days.map((day, index) => (
                <div
                  key={index}
                  onClick={() => openEventModal(null, day.date)}
                  className={`min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                    !day.isCurrentMonth ? "bg-gray-50 dark:bg-gray-900/50" : ""
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm ${
                    day.date.toDateString() === new Date().toDateString()
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300"
                  }`}>
                    {day.date.getDate()}
                  </span>
                  
                  <div className="mt-1 space-y-1">
                    {filteredEvents(day.events).slice(0, 3).map((event) => (
                      <div
                        key={event._id}
                        onClick={(e) => { e.stopPropagation(); openEventModal(event); }}
                        className={`px-2 py-1 rounded text-xs cursor-pointer transition ${eventColors[event.color]} text-white truncate`}
                      >
                        <div className="flex items-center gap-1">
                          {getEventTypeIcon(event.type)}
                          <span>{event.title}</span>
                        </div>
                      </div>
                    ))}
                    {filteredEvents(day.events).length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        +{filteredEvents(day.events).length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Week View */}
        {view === "week" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">Time</div>
              {weekDays.map((day, index) => (
                <div key={index} className="p-3 text-center">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {day.date.toLocaleDateString('default', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-semibold ${
                    day.date.toDateString() === new Date().toDateString()
                      ? "text-blue-600"
                      : "text-gray-900 dark:text-white"
                  }`}>
                    {day.date.getDate()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="overflow-y-auto max-h-[600px]">
              {hours.map((hour, hourIndex) => (
                <div key={hourIndex} className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 min-h-[60px]">
                  <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                    {hour.label}
                  </div>
                  {weekDays.map((day, dayIndex) => {
                    const hourEvents = day.events.filter(event => {
                      const eventHour = new Date(event.startDate).getHours();
                      return eventHour === hour.hour;
                    });
                    
                    return (
                      <div
                        key={dayIndex}
                        onClick={() => {
                          const date = new Date(day.date);
                          date.setHours(hour.hour);
                          openEventModal(null, date);
                        }}
                        className="p-1 border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {hourEvents.map((event) => (
                          <div
                            key={event._id}
                            onClick={(e) => { e.stopPropagation(); openEventModal(event); }}
                            className={`px-2 py-1 rounded text-xs cursor-pointer transition ${eventColors[event.color]} text-white mb-1`}
                          >
                            <div className="flex items-center gap-1">
                              {getEventTypeIcon(event.type)}
                              <span className="truncate">{event.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day View */}
        {view === "day" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
            </div>
            
            <div className="overflow-y-auto max-h-[600px]">
              {hours.map((hour, hourIndex) => {
                const hourEvents = events.filter(event => {
                  const eventHour = new Date(event.startDate).getHours();
                  return eventHour === hour.hour;
                });
                
                return (
                  <div key={hourIndex} className="flex border-b border-gray-200 dark:border-gray-700 min-h-[60px]">
                    <div className="w-20 p-2 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                      {hour.label}
                    </div>
                    <div
                      onClick={() => {
                        const date = new Date(currentDate);
                        date.setHours(hour.hour);
                        openEventModal(null, date);
                      }}
                      className="flex-1 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {hourEvents.map((event) => (
                        <div
                          key={event._id}
                          onClick={(e) => { e.stopPropagation(); openEventModal(event); }}
                          className={`px-3 py-2 rounded-lg cursor-pointer transition ${eventColors[event.color]} text-white mb-2`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getEventTypeIcon(event.type)}
                              <span className="font-medium">{event.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Clock className="w-3 h-3" />
                              <span>
                                {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1 text-xs mt-1 opacity-90">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedEvent ? "Edit Event" : "Create New Event"}
                </h2>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Type
                    </label>
                    <select
                      value={eventForm.type}
                      onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="call">Phone Call</option>
                      <option value="video">Video Call</option>
                      <option value="followup">Follow-up</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {Object.keys(eventColors).map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEventForm({ ...eventForm, color })}
                          className={`w-8 h-8 rounded-full ${eventColors[color]} ${
                            eventForm.color === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={eventForm.startDate}
                      onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={eventForm.endDate}
                      onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location / Meeting Link
                  </label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="Office, Zoom link, Google Meet, etc."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Add details about this event..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attendees (comma separated)
                  </label>
                  <input
                    type="text"
                    value={attendeesList}
                    onChange={(e) => setAttendeesList(e.target.value)}
                    placeholder="email@example.com, client@company.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Related Lead
                    </label>
                    <select
                      value={eventForm.leadId}
                      onChange={(e) => setEventForm({ ...eventForm, leadId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">None</option>
                      {leads.map(lead => (
                        <option key={lead._id} value={lead._id}>{lead.name} - {lead.email}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reminder (minutes before)
                    </label>
                    <select
                      value={eventForm.reminder}
                      onChange={(e) => setEventForm({ ...eventForm, reminder: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="0">None</option>
                      <option value="5">5 minutes</option>
                      <option value="10">10 minutes</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="1440">1 day</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recurrence
                  </label>
                  <select
                    value={eventForm.recurrence}
                    onChange={(e) => setEventForm({ ...eventForm, recurrence: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {selectedEvent ? "Update Event" : "Create Event"}
                  </button>
                  {selectedEvent && (
                    <button
                      type="button"
                      onClick={handleDeleteEvent}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Calendar;