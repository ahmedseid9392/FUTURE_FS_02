import Lead from "../models/Lead.js";


// @desc    Create new lead
// @route   POST /api/leads
export const createLead = async (req, res) => {
  try {
    const { name, email, source } = req.body;

    const lead = await Lead.create({
      name,
      email,
      source
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get all leads
// @route   GET /api/leads
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Update lead status
// @route   PUT /api/leads/:id
export const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Delete lead
// @route   DELETE /api/leads/:id
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({ message: "Lead deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};