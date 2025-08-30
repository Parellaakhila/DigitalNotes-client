import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCheck, FaUndo, FaRedo, FaPalette, FaImage, FaFont, FaMicrophone, FaPlus, FaDownload, FaFileImport, FaHeart, FaRegHeart, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';
import axios from 'axios';
import './NotesInput.css';

const NoteInput = ({ addNote, updateNote, notes }) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [folder, setFolder] = useState('Personal');
  const [bgColor, setBgColor] = useState('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  const [bgImage, setBgImage] = useState('');
  const [images, setImages] = useState([]);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [showColors, setShowColors] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showFonts, setShowFonts] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importText, setImportText] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams(); // Get note ID from URL for edit mode

  const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];

  // Create axios instance with auth headers
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

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = () => {
      const username = localStorage.getItem('username');
      const email = localStorage.getItem('email');
      const userId = localStorage.getItem('userId');
      
      if (username && email && userId) {
        setUser({
          username,
          email,
          id: userId
        });
      }
    };

    loadUserData();
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if we're in edit mode and load existing note data
  useEffect(() => {
    if (id && notes) {
      const noteToEdit = notes.find(note => note._id === id);
      if (noteToEdit) {
        setTitle(noteToEdit.title || '');
        setNote(noteToEdit.note || '');
        setFolder(noteToEdit.folder || 'Personal');
        setBgColor(noteToEdit.bgColor || '	#E0BBE4');
        setBgImage(noteToEdit.bgImage || '');
        setImages(noteToEdit.images || []);
        setFontFamily(noteToEdit.font || 'Arial');
        setIsFavorite(noteToEdit.favorite || false);
        console.log('Loaded note for editing:', noteToEdit);
      } else {
        console.error('Note not found for editing');
        alert('Note not found');
        navigate('/main');
      }
    }
  }, [id, notes, navigate]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recog = new window.webkitSpeechRecognition();
      recog.lang = 'en-US';
      recog.continuous = false;

      recog.onresult = (event) => {
        const speech = event.results[0][0].transcript;
        setNote(prev => prev + ' ' + speech);
      };

      recog.onerror = (e) => console.error('Speech error', e);
      recog.onend = () => setIsRecording(false);
      recognitionRef.current = recog;
    }
  }, []);

  // Debug: Log when folder/tag changes
  useEffect(() => {
    console.log('Current selected tag:', folder);
  }, [folder]);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  const handleNavigateToHome = () => {
    navigate('/home');
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prev = history.pop();
      setFuture([{ title, note }, ...future]);
      setTitle(prev.title);
      setNote(prev.note);
      setHistory([...history]);
    }
  };

  const handleRedo = () => {
    if (future.length > 0) {
      const next = future.shift();
      setHistory([...history, { title, note }]);
      setTitle(next.title);
      setNote(next.note);
      setFuture([...future]);
    }
  };

  const handleChange = (setter) => (e) => {
    setHistory([...history, { title, note }]);
    setter(e.target.value);
  };

  const handleAddImage = (file) => {
    const url = URL.createObjectURL(file);
    setImages(prev => [...prev, url]);
  };

  const handleAddCustomBg = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const file = e.target.files[0];
      if (file) setBgImage(URL.createObjectURL(file));
    };
    input.click();
  };

  const handleTakePicture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = e => {
      const file = e.target.files[0];
      if (file) handleAddImage(file);
    };
    input.click();
  };

  const handleChooseFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const file = e.target.files[0];
      if (file) handleAddImage(file);
    };
    input.click();
  };

  const handleTagChange = (e) => {
    const selectedTag = e.target.value;
    console.log('Tag changed to:', selectedTag);
    setFolder(selectedTag);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Import functionality
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        
        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          if (Array.isArray(jsonData)) {
            // Multiple notes
            jsonData.forEach(noteData => {
              if (noteData.title && noteData.content) {
                setTitle(noteData.title);
                setNote(noteData.content);
                setFolder(noteData.folder || 'Personal');
                if (noteData.bgColor) setBgColor(noteData.bgColor);
                if (noteData.font) setFontFamily(noteData.font);
                if (noteData.favorite) setIsFavorite(noteData.favorite);
              }
            });
          } else {
            // Single note
            if (jsonData.title && jsonData.content) {
              setTitle(jsonData.title);
              setNote(jsonData.content);
              setFolder(jsonData.folder || 'Personal');
              if (jsonData.bgColor) setBgColor(jsonData.bgColor);
              if (jsonData.font) setFontFamily(jsonData.font);
              if (jsonData.favorite) setIsFavorite(jsonData.favorite);
            }
          }
        } else if (file.name.endsWith('.txt')) {
          // Plain text file
          const lines = content.split('\n');
          if (lines.length > 0) {
            setTitle(lines[0] || 'Imported Note');
            setNote(lines.slice(1).join('\n'));
          }
        } else if (file.name.endsWith('.csv')) {
          // CSV file
          const lines = content.split('\n');
          if (lines.length > 1) {
            const headers = lines[0].split(',');
            const data = lines[1].split(',');
            const titleIndex = headers.findIndex(h => h.toLowerCase().includes('title'));
            const contentIndex = headers.findIndex(h => h.toLowerCase().includes('content') || h.toLowerCase().includes('note'));
            
            if (titleIndex !== -1 && contentIndex !== -1) {
              setTitle(data[titleIndex] || 'Imported Note');
              setNote(data[contentIndex] || '');
            }
          }
        }
        
        alert('File imported successfully!');
      } catch (error) {
        console.error('Error importing file:', error);
        alert('Error importing file. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
  };

  const handleTextImport = () => {
    if (importText.trim()) {
      const lines = importText.split('\n');
      if (lines.length > 0) {
        setTitle(lines[0] || 'Imported Note');
        setNote(lines.slice(1).join('\n'));
        setImportText('');
        setShowImport(false);
        alert('Text imported successfully!');
      }
    } else {
      alert('Please enter some text to import.');
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to save notes');
      navigate('/login');
      return;
    }

    if (!title.trim() || !note.trim()) {
      alert('Please enter both title and note content');
      return;
    }

    setIsLoading(true);

    const noteData = {
      title,
      note: note,
      date: new Date().toLocaleDateString(),
      folder: folder,
      font: fontFamily,
      bgColor,
      bgImage,
      images,
      favorite: isFavorite
    };

    try {
      if (id) {
        // Edit mode - update existing note
        console.log('Updating note with ID:', id);
        const res = await api.put(`/notes/${id}`, noteData);
        console.log('Note updated successfully:', res.data);
        if (updateNote) {
          updateNote(res.data);
        }
        alert(`Note updated successfully in ${folder} category!`);
      } else {
        // Create mode - add new note
        console.log('Creating new note');
        const res = await api.post('/notes', noteData);
        console.log('Note created successfully:', res.data);
        if (addNote) {
          addNote(res.data);
        }
        alert(`Note saved successfully in ${folder} category!`);
      }
      
      navigate('/main');
    } catch (error) {
      console.error('Error saving note:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Session expired. Please login again.');
        navigate('/login');
      } else {
        alert('Error saving note. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Generate user initials for avatar
  const getUserInitials = () => {
    if (!user?.username) return '?';
    return user.username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="note-input-container">
      {/* Mode indicator */}
      <div className="mode-indicator">
        <h2>{id ? '✏️ Edit Note' : '📝 Create New Note'}</h2>
        {id && <p className="edit-mode-info">You're editing an existing note</p>}
        {/* User Welcome Message */}
        {user && (
          <div className="user-welcome">
            <span className="welcome-text">Welcome back, </span>
            <span className="username-display">{user.username}</span>
            <span className="welcome-emoji">👋</span>
          </div>
        )}
      </div>

      <div
        className="note-card"
        style={{
          background: bgImage ? `url(${bgImage}) center/cover no-repeat` : bgColor,
          fontFamily
        }}
      >
        <div className="toolbar">
          <div className="toolbar-left">
            {/* User Profile */}
            <div className="user-profile" ref={profileMenuRef}>
              <button 
                className="profile-avatar"
                onClick={toggleProfileMenu}
                title="Click to view profile"
              >
                <span className="avatar-text">{getUserInitials()}</span>
              </button>
              
              {showProfileMenu && (
                <div className="profile-menu">
                  <div className="profile-header">
                    <div className="profile-avatar-large">
                      <span className="avatar-text">{getUserInitials()}</span>
                    </div>
                    <div className="profile-info">
                      <h4 className="profile-name">{user?.username || 'User'}</h4>
                      <p className="profile-email">{user?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                  
                  <div className="profile-actions">
                    <button 
                      className="profile-action-btn"
                      onClick={handleNavigateToDashboard}
                    >
                      <FaCog className="action-icon" />
                      Dashboard
                    </button>
                    <button 
                      className="profile-action-btn"
                      onClick={handleNavigateToHome}
                    >
                      <FaUser className="action-icon" />
                      All Notes
                    </button>
                    <button 
                      className="profile-action-btn logout-btn"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="action-icon" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="toolbar-right">
            <button 
              className={`save-button ${isLoading ? 'loading' : ''}`}
              onClick={handleSave}
              disabled={isLoading}
              title={id ? "Update Note" : "Save Note"}
            >
              {isLoading ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                <FaCheck className="icon save" />
              )}
              {id ? 'Update' : 'Save'}
            </button>
            <FaUndo className="icon" onClick={handleUndo} title="Undo" />
            <FaRedo className="icon" onClick={handleRedo} title="Redo" />
            <button 
              className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
              onClick={toggleFavorite}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              {isFavorite ? <FaHeart className="icon heart-filled" /> : <FaRegHeart className="icon heart-outline" />}
            </button>
            <FaFileImport 
              className="icon import-icon" 
              onClick={() => setShowImport(!showImport)} 
              title="Import Note" 
            />
          </div>
        </div>

        {/* Favorite indicator */}
        {isFavorite && (
          <div className="favorite-indicator">
            <FaHeart className="favorite-star" />
            <span className="favorite-text">FAVORITE</span>
          </div>
        )}

        <input
          placeholder="Title"
          value={title}
          onChange={handleChange(setTitle)}
          className="note-title"
          style={{ fontFamily }}
        />

        <textarea
          placeholder="Write your note..."
          value={note}
          onChange={handleChange(setNote)}
          className="note-text"
          style={{ fontFamily }}
        />

        <div className="note-images">
          {images.map((url, idx) => (
            <img src={url} key={idx} alt="note-img" />
          ))}
        </div>

        <div className="bottom-toolbar">
          <FaPalette onClick={() => {
            setShowColors(!showColors);
            setShowGallery(false);
            setShowFonts(false);
            setShowImport(false);
          }} />
          <FaImage onClick={() => {
            setShowGallery(!showGallery);
            setShowColors(false);
            setShowFonts(false);
            setShowImport(false);
          }} />
          <FaFont onClick={() => {
            setShowFonts(!showFonts);
            setShowColors(false);
            setShowGallery(false);
            setShowImport(false);
          }} />
          <FaMicrophone onClick={toggleRecording} style={{ color: isRecording ? 'red' : 'white' }} />
        </div>

        <select value={folder} onChange={handleTagChange} className="folder-select">
          <option value="Personal">📁 Personal</option>
          <option value="Work">💼 Work</option>
          <option value="Important" className="important-option">⭐ Important</option>
        </select>

        {/* Tag indicator */}
        <div className="selected-tag-indicator">
          <span className={`tag-badge ${folder === 'Important' ? 'important-badge' : ''}`}>
            {folder === 'Personal' && '📁 Personal'}
            {folder === 'Work' && '💼 Work'}
            {folder === 'Important' && '⭐ Important'}
          </span>
        </div>

        {/* Import Modal */}
        {showImport && (
          <div className="import-modal">
            <div className="import-content">
              <h3>📥 Import Note</h3>
              
              {/* File Import */}
              <div className="import-section">
                <h4>📁 Import from File</h4>
                <p>Supported formats: JSON, TXT, CSV</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileImport}
                  accept=".json,.txt,.csv"
                  style={{ display: 'none' }}
                />
                <button 
                  className="import-file-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📁 Choose File
                </button>
              </div>

              {/* Text Import */}
              <div className="import-section">
                <h4>📝 Import from Text</h4>
                <p>First line will be the title, rest will be the content</p>
                <textarea
                  placeholder="Enter your text here...&#10;First line = title&#10;Rest = content"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="import-textarea"
                  rows="6"
                />
                <button 
                  className="import-text-btn"
                  onClick={handleTextImport}
                >
                  📝 Import Text
                </button>
              </div>

              <button 
                className="close-import-btn"
                onClick={() => setShowImport(false)}
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}

        {showColors && (
          <div className="color-options">
            {[
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
            ].map((gradient, index) => (
              <div 
                key={index} 
                className="color-dot" 
                style={{ background: gradient }} 
                onClick={() => { setBgColor(gradient); setBgImage(''); }} 
              />
            ))}
            <FaPlus onClick={handleAddCustomBg} className="add-bg" />
          </div>
        )}

        {showGallery && (
          <div className="gallery-options">
            
            <button onClick={handleChooseFromGallery}>🖼 Choose from Gallery</button>
          </div>
        )}

        {showFonts && (
          <div className="font-options">
            {fonts.map(f => (
              <button key={f} style={{ fontFamily: f }} onClick={() => setFontFamily(f)}>{f}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteInput;