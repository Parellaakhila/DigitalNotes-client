import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import videoFile from "../assets/video.mp4";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      {/* Background Video */}
      <video src={videoFile} autoPlay loop muted />

      {/* Overlay Content */}
      <div className="homepage-overlay">
        <h1>Digital Notes </h1>
        <p>Organize your thoughts. Anytime. Anywhere.</p>
        <div>
          <button
            onClick={() => navigate("/login")}
            className="button login"
          >  
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="button signup"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
