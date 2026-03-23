import { useState } from "react";
import API from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMessage("Reset token generated (check backend console)");
    } catch (err) {
      setMessage("Error sending reset request");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded w-80">

        <h2 className="text-xl mb-4">Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full mb-3 p-2 border"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="bg-blue-500 text-white w-full py-2">
          Send Reset Link
        </button>

        {message && <p className="mt-3 text-sm">{message}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;