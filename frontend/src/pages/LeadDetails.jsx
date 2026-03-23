import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import Layout from "../components/Layout";

const LeadDetails = () => {
  const { id } = useParams();

  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");

  const fetchNotes = async () => {
    const res = await API.get(`/notes/${id}`);
    setNotes(res.data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async (e) => {
    e.preventDefault();

    await API.post(`/notes/${id}`, { text });
    setText("");
    fetchNotes();
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Lead Details</h2>

      {/* Add Note */}
      <form onSubmit={addNote} className="mb-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add note..."
          className="border p-2 flex-1 rounded"
          required
        />

        <button className="bg-blue-500 text-white px-4 rounded">
          Add
        </button>
      </form>

      {/* Notes Timeline */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note._id}
            className="bg-white p-3 rounded shadow"
          >
            <p>{note.text}</p>
            <span className="text-sm text-gray-500">
              {new Date(note.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default LeadDetails;