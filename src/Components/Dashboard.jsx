// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId || !token) {
        alert('User not logged in');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user notes
        const notesResponse = await axios.get('http://localhost:5000/api/notes', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setNotes(notesResponse.data || []);
        
        // Debug: Log the notes data
        console.log('Dashboard: Notes response:', notesResponse.data);
        console.log('Dashboard: Notes array:', notesResponse.data || []);
        
        // Set user data from localStorage or create a basic user object
        const userData = {
          username: localStorage.getItem('username') || 'User',
          email: localStorage.getItem('email') || 'user@example.com'
        };
        setUser(userData);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        
        // If token is invalid, redirect to login
        if (err.response?.status === 401) {
          localStorage.removeItem('userId');
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId, token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const handleNavigateToHome = () => {
    navigate('/home');
  };

  const handleNavigateToCreate = () => {
    navigate('/new');
  };

  // Calculate statistics
  const totalNotes = notes.length;
  const importantNotes = notes.filter(note => note.folder === 'Important').length;
  const favoriteNotes = notes.filter(note => note.favorite).length;
  const recentNotes = notes.slice(0, 3); // Get last 3 notes
  
  // Debug: Log statistics
  console.log('Dashboard: Total notes:', totalNotes);
  console.log('Dashboard: Important notes:', importantNotes);
  console.log('Dashboard: Favorite notes:', favoriteNotes);
  console.log('Dashboard: Notes array for debugging:', notes);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-main-title">📊 Dashboard</h1>
        <button className="dashboard-logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      <div className="dashboard-content">
        {/* Welcome Card */}
        <div className="dashboard-card welcome-card">
          <h2 className="dashboard-title">Welcome back, {user?.username}! 👋</h2>
          <p className="dashboard-email">{user?.email}</p>
          <div className="dashboard-actions">
            <button className="dashboard-action-btn primary" onClick={handleNavigateToHome}>
              📝 View All Notes
            </button>
            <button className="dashboard-action-btn secondary" onClick={handleNavigateToCreate}>
              ✨ Create New Note
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-info">
              <h3>{totalNotes}</h3>
              <p>Total Notes</p>
            </div>
          </div>
          
          <div className="stat-card important">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>{importantNotes}</h3>
              <p>Important Notes</p>
            </div>
          </div>
          
          <div className="stat-card favorite">
            <div className="stat-icon">❤️</div>
            <div className="stat-info">
              <h3>{favoriteNotes}</h3>
              <p>Favorite Notes</p>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Dashboard;