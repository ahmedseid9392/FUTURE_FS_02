import Note from "../models/Note.js";


// ➕ Add Note
export const addNote = async (req, res) => {
  try {
    const { text } = req.body;

    const note = await Note.create({
      lead: req.params.leadId,
      text
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 📄 Get Notes by Lead
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ lead: req.params.leadId })
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};