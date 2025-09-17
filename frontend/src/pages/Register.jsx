import { useState } from "react";
import { api } from "../api/api.js";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Register() {
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register",{name,email,password});
      toast.success("Registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Registration failed!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 p-4">
      <form
        onSubmit={handleRegister}
        className="bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl ring-1 ring-black/5 w-full max-w-md space-y-6 animate-fade-in"
      >
        <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
          Create Account
        </h2>
        <p className="text-center text-gray-600 mb-6">Join us and start chatting with AI!</p>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-800 placeholder-gray-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-800 placeholder-gray-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-800 placeholder-gray-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          Sign Up
        </button>

        <p className="text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline hover:text-blue-700 transition">
            Login Here
          </Link>
        </p>
      </form>
    </div>
  );
}
