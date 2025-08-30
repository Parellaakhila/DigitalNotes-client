import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './Components/SignUp';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import Home from './Components/Home';
import MainContent from './Components/MainContent';
import NotesInput from './Components/NotesInput';

function App() {
  const [notes, setNotes] = useState([]);

  // Create axios instance with default config
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to include auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchNotes();
    }
  }, []);

  // Debug: Log when notes state changes
  useEffect(() => {
    console.log('App.jsx: Notes state updated:', notes);
  }, [notes]); 

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping notes fetch');
        return;
      }
      
      const res = await api.get('/notes');
      setNotes(res.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  };

  const addNote = async (note) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const res = await api.post('/notes', note);
      console.log('App.jsx: Note saved to backend:', res.data);
      // Add the new note to the beginning of the list
      setNotes(prevNotes => {
        const newNotes = [res.data, ...prevNotes];
        console.log('App.jsx: Updated notes state:', newNotes);
        return newNotes;
      });
    } catch (error) {
      console.error('Error adding note:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  };

  const updateNote = async (updatedNote) => {
    try {
      const res = await api.put(`/notes/${updatedNote._id}`, updatedNote);
      setNotes(notes.map(note => 
        note._id === updatedNote._id ? res.data : note
      ));
    } catch (error) {
      console.error('Error updating note:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter(note => note._id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const note = notes.find(n => n._id === id || n.id === id);
      if (note) {
        const updatedNote = { ...note, favorite: !note.favorite };
        const res = await api.put(`/notes/${id}`, updatedNote);
        setNotes(notes.map(note => 
          (note._id === id || note.id === id) ? res.data : note
        ));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const shareNote = (note) => {
    const mailtoLink = `mailto:?body=${encodeURIComponent(note.note)}`;
    window.open(mailtoLink);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new" element={<NotesInput addNote={addNote} />} />
        <Route path="/main" element={
          <MainContent
            notes={notes}
            onDelete={deleteNote}
            onEdit={(id) => {
              // Navigate to edit page with the note ID
              window.location.href = `/edit/${id}`;
            }}
            onUpdate={updateNote}
            onFavorite={toggleFavorite}
          />
        } />
        <Route path="/home" element={
          <MainContent
            notes={notes}
            onDelete={deleteNote}
            onEdit={(id) => {
              // Navigate to edit page with the note ID
              window.location.href = `/edit/${id}`;
            }}
            onUpdate={updateNote}
            onFavorite={toggleFavorite}
          />
        } />
        
        <Route path="/edit/:id" element={
          <NotesInput 
            addNote={addNote} 
            updateNote={updateNote} 
            notes={notes} 
          />
        } />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;