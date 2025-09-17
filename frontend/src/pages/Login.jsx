import { useState } from "react";
import { api } from "../api/api.js";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthProvider,useAuth } from "../context/AuthContext";

export default function Login() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = async(e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login",{email,password});
      login(res.data.token); // ✅ use AuthContext
      toast.success("Login successful!");
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl ring-1 ring-black/5 w-full max-w-md space-y-6 animate-fade-in"
      >
        <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600 mb-6">Log in to continue your AI chat experience.</p>

        <input
          type="email"
          placeholder="Email Address"
          className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none text-gray-800 placeholder-gray-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none text-gray-800 placeholder-gray-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          Log In
        </button>

        <p className="text-center text-gray-600 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-purple-600 font-bold hover:underline hover:text-indigo-700 transition">
            Register Here
          </Link>
        </p>
      </form>
    </div>
  );
}
