import Lead from '../models/Lead.js';

export const getLeads = async (req, res) => {
  try {
    console.log('Fetching leads for user:', req.user.id);
    const leads = await Lead.find({ userId: req.user.id }).sort({ createdAt: -1 });
    console.log(`Found ${leads.length} leads`);
    res.json(leads);
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createLead = async (req, res) => {
  try {
    console.log('Creating lead for user:', req.user.id);
    const lead = new Lead({
      ...req.body,
      userId: req.user.id,
      status: req.body.status || 'new'
    });
    await lead.save();
    console.log('Lead created:', lead.name);
    res.status(201).json(lead);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addNote = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, userId: req.user.id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    lead.notes.push({
      text: req.body.text,
      createdBy: req.user.email,
      createdAt: new Date()
    });
    await lead.save();
    res.json(lead);
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNotes = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, userId: req.user.id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead.notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};