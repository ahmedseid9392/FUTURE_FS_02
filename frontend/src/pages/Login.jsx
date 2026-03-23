import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [remember, setRemember] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", form);

      if (remember) {
  localStorage.setItem("token", res.data.token);
} else {
  sessionStorage.setItem("token", res.data.token);
}

      navigate("/dashboard");
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-80"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Admin Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full border p-2 mb-4 rounded"
          required
        />
  <input
  type="checkbox"
  onChange={(e) => setRemember(e.target.checked)}
  /> Remember me
        <button className="w-full bg-blue-500 text-white py-2 rounded">
          Login
        </button>

           <div className="flex justify-between text-sm mt-3">

  {/* FORGOT PASSWORD */}
  <span
    onClick={() => navigate("/forgot")}
    className="text-blue-500 cursor-pointer"
  >
    Forgot Password?
  </span>

  {/* REGISTER */}
  <span
    onClick={() => navigate("/register")}
    className="text-green-500 cursor-pointer"
  >
    Create Account
  </span>

</div>
      </form>
   
    </div>
  );
};

export default Login;