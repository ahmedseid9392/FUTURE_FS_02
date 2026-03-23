import { useState } from "react";
import API from "../services/api";

const LeadForm = ({ fetchLeads }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    source: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/leads", form);
      setForm({ name: "", email: "", source: "" });
      fetchLeads(); // refresh table
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow mb-6"
    >
      <h3 className="text-lg font-semibold mb-3">Add New Lead</h3>

      <div className="grid grid-cols-3 gap-3">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          name="source"
          placeholder="Source"
          value={form.source}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        Add Lead
      </button>
    </form>
  );
};

export default LeadForm;