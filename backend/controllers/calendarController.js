import Event from '../models/Event.js';
import Lead from '../models/Lead.js';

// Get events for a date range
export const getEvents = async (req, res) => {
  try {
    const { year, month, startDate, endDate } = req.query;
    
    let query = { userId: req.user.id };
    
    if (year && month) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      query.startDate = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const events = await Event.find(query).sort({ startDate: 1 });
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create event
export const createEvent = async (req, res) => {
  try {
    const { title, description, type, startDate, endDate, location, attendees, leadId, reminder, recurrence, color } = req.body;
    
    const event = new Event({
      userId: req.user.id,
      title,
      description,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
      attendees: attendees || [],
      leadId,
      reminder: reminder || 15,
      recurrence: recurrence || 'none',
      color: color || 'blue'
    });
    
    await event.save();
    
    // If lead is associated, update lead with event
    if (leadId) {
      await Lead.findByIdAndUpdate(leadId, {
        $push: { events: event._id }
      });
    }
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const event = await Event.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findOneAndDelete({ _id: id, userId: req.user.id });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Remove event from lead if associated
    if (event.leadId) {
      await Lead.findByIdAndUpdate(event.leadId, {
        $pull: { events: event._id }
      });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};