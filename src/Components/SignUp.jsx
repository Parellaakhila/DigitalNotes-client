import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SignUp.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  // API base URL (from Vercel .env or fallback)
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || password.length < 6 || password !== confirmPassword) {
      alert("Please fill all fields and make sure passwords match (min 6 characters).");
      return;
    }

    try {
      const response = await axios.post(`${API}/api/auth/register`, {
        username,
        email,
        password,
        confirmPassword,
      });

      alert("Signup successful!");
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err.response || err.message); // 👈 debug log
      const error = err.response?.data?.error || "Signup failed. Try again.";
      alert(error);
    }
  };

  return (
    <div
      className="auth-container"
      style={{
        background: "linear-gradient(135deg, #a8edea, #fed6e3)",
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="auth-box">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Sign Up</button>
          <div className="switch-link">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
