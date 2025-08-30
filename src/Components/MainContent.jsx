import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaUserCircle, FaEllipsisV, FaStar, FaTrash, FaEdit, FaCopy, FaSearch, FaDownload, FaHeart, FaRegHeart } from 'react-icons/fa';
import './MainContent.css';

const MainContent = ({ notes, onDelete, onEdit, onFavorite }) => {
  const navigate = useNavigate();
  const [expandedNotes, setExpandedNotes] = useState([]); // Tracks which notes are expanded
  const [activeFolder, setActiveFolder] = useState('All'); // Tracks selected folder
  const [searchQuery, setSearchQuery] = useState(''); // Tracks search query

  // Debug: Log notes to see what data we're receiving
  console.log('MainContent received notes:', notes);

  const handleEdit = (noteId) => {
    navigate(`/edit/${noteId}`);
  };

  const handleCopy = (note) => {
    const content = getNoteContent(note);
    navigator.clipboard.writeText(`${note.title}\n${content || ''}`);
    alert('Copied to clipboard!');
  };

  const handleExportNote = (note) => {
    const noteData = {
      title: note.title,
      content: getNoteContent(note),
      folder: getNoteFolder(note),
      date: note.date,
      bgColor: note.bgColor,
      font: note.font
    };

    const dataStr = JSON.stringify(noteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBulkExport = () => {
    const notesToExport = filteredNotes.map(note => ({
      title: note.title,
      content: getNoteContent(note),
      folder: getNoteFolder(note),
      date: note.date,
      bgColor: note.bgColor,
      font: note.font
    }));

    const dataStr = JSON.stringify(notesToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notes_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleExpand = (idx) => {
    console.log('Toggling expand for note index:', idx);
    setExpandedNotes((prev) => {
      const newExpanded = prev.includes(idx) 
        ? prev.filter((i) => i !== idx) 
        : [...prev, idx];
      console.log('New expanded notes:', newExpanded);
      return newExpanded;
    });
  };

  const handleFolderClick = (folder) => {
    console.log('Folder clicked:', folder);
    setActiveFolder(folder);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // More robust filtering function
  const getNoteFolder = (note) => {
    // Handle backend response structure - backend uses 'folder' field
    return note.folder || note.category || note.tag || note.type || 'Personal';
  };

  // Get note content
  const getNoteContent = (note) => {
    // Backend uses 'note' field for content
    return note.note || note.content || '';
  };

  // Filter notes based on active folder and search query
  const filteredNotes = notes.filter((note) => {
    const noteFolder = getNoteFolder(note);
    
    // Handle folder filtering
    let matchesFolder = false;
    if (activeFolder === 'All') {
      matchesFolder = true; // Show all notes
    } else if (activeFolder === 'Favorites') {
      matchesFolder = note.favorite || false; // Show only favorite notes
    } else {
      matchesFolder = noteFolder === activeFolder; // Show notes matching the selected folder
    }
    
    // Handle search filtering
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFolder && matchesSearch;
  });

  console.log('Active folder:', activeFolder);
  console.log('Search query:', searchQuery);
  console.log('All notes:', notes);
  console.log('Filtered notes:', filteredNotes);
  console.log('Notes with folders:', notes.map(note => ({ title: note.title, folder: note.folder })));

  return (
    <div className="home">
      <div className="home-header">
        <span className="home-title">Notes</span>
       
      </div>

      {/* Search Bar */}
      <div className="home-search">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search notes by title..." 
            className="home-search-bar"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button onClick={clearSearch} className="clear-search-btn">
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="search-results-info">
            Found {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </div>
        )}
      </div>

      <div className="home-folders">
        <button
          className={`home-folder-btn ${activeFolder === 'All' ? 'active' : ''}`}
          onClick={() => handleFolderClick('All')}
          data-folder="All"
        >
          📋 All Notes
        </button>
        <button
          className={`home-folder-btn ${activeFolder === 'Personal' ? 'active' : ''}`}
          onClick={() => handleFolderClick('Personal')}
          data-folder="Personal"
        >
          📁 Personal
        </button>
        <button
          className={`home-folder-btn ${activeFolder === 'Work' ? 'active' : ''}`}
          onClick={() => handleFolderClick('Work')}
          data-folder="Work"
        >
          💼 Work
        </button>
        <button
          className={`home-folder-btn ${activeFolder === 'Important' ? 'active' : ''}`}
          onClick={() => handleFolderClick('Important')}
          data-folder="Important"
        >
          ⭐ Important
        </button>
        <button
          className={`home-folder-btn favorites-btn ${activeFolder === 'Favorites' ? 'active' : ''}`}
          onClick={() => handleFolderClick('Favorites')}
          data-folder="Favorites"
        >
          ❤️ Favorites
        </button>
      </div>

      {/* Active tag indicator */}
      <div className="active-tag-display">
        <span className="active-tag-badge">
          {activeFolder === 'All' && '📋 Showing All Notes'}
          {activeFolder === 'Personal' && '📁 Personal Notes'}
          {activeFolder === 'Work' && '💼 Work Notes'}
          {activeFolder === 'Important' && '⭐ Important Notes'}
          {activeFolder === 'Favorites' && '❤️ Favorite Notes'}
        </span>
        <span className="note-count">({filteredNotes.length} notes)</span>
      </div>

      <div className="home-notes-grid">
        {filteredNotes.length === 0 ? (
          <div style={{ textAlign: 'center', width: '100%', padding: '20px' }}>
            <p>
              {searchQuery 
                ? `No notes found matching "${searchQuery}" in ${activeFolder === 'All' ? 'any category' : activeFolder}.`
                : 'No notes found. Create your first note!'
              }
            </p>
          </div>
        ) : (
          filteredNotes.map((note, idx) => {
            console.log('Rendering note:', note, 'index:', idx);
            const isImportant = getNoteFolder(note) === 'Important';
            const isFavorite = note.favorite || false;
            return (
              <div 
                key={note._id || idx} 
                className={`home-note-card ${isImportant ? 'important-note' : ''} ${isFavorite ? 'favorite-note' : ''}`} 
                style={{ 
                  background: note.bgColor,
                  border: isImportant ? '3px solid #ff6b6b' : isFavorite ? '3px solid #e74c3c' : '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                {isImportant && (
                  <div className="important-indicator">
                    <span className="important-star">⭐</span>
                    <span className="important-text">IMPORTANT</span>
                  </div>
                )}
                
                {isFavorite && (
                  <div className="favorite-indicator">
                    <FaHeart className="favorite-star" />
                    <span className="favorite-text">FAVORITE</span>
                  </div>
                )}
                
                <div className="note-title-and-options">
                  <div className={`home-note-title ${isImportant ? 'important-title' : ''} ${isFavorite ? 'favorite-title' : ''}`}>
                    {isImportant && <span className="priority-indicator">🔴</span>}
                    {isFavorite && <span className="favorite-indicator-dot">❤️</span>}
                    {note.title}
                  </div>
                  <div className="note-options">
                    <FaEllipsisV className="options-icon" />
                    <div className="options-menu">
                      <button 
                        className={`favorite-toggle ${isFavorite ? 'favorited' : ''}`}
                        onClick={() => onFavorite(note._id || idx)}
                        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                      >
                        {isFavorite ? <FaHeart className="heart-filled" /> : <FaRegHeart className="heart-outline" />}
                      </button>
                      <FaDownload title="Export" onClick={() => handleExportNote(note)} />
                      <FaTrash title="Delete" onClick={() => onDelete(note._id || idx)} />
                      <FaEdit title="Edit" onClick={() => handleEdit(note._id || idx)} />
                      <FaCopy title="Copy" onClick={() => handleCopy(note)} />
                    </div>
                  </div>
                </div>

                {/* Folder indicator */}
                <div className={`note-folder-indicator ${isImportant ? 'important-folder' : ''} ${isFavorite ? 'favorite-folder' : ''}`}>
                  {isImportant ? '⭐ Important' : `📁 ${getNoteFolder(note)}`}
                  {isFavorite && <span className="favorite-heart"> ❤️</span>}
                </div>

                {/* View Content button */}
                {getNoteContent(note).trim() !== '' && (
                  <button
                    className={`view-content-btn ${isImportant ? 'important-btn' : ''} ${isFavorite ? 'favorite-btn' : ''}`}
                    onClick={() => toggleExpand(idx)}
                  >
                    {expandedNotes.includes(idx) ? 'Hide Content' : 'View Content'}
                  </button>
                )}

                {/* Show content if expanded */}
                {expandedNotes.includes(idx) && getNoteContent(note).trim() !== '' && (
                  <div className={`home-note-content ${isImportant ? 'important-content' : ''} ${isFavorite ? 'favorite-content' : ''}`}>
                    {getNoteContent(note)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <button className="home-add-btn" onClick={() => navigate('/new')}>
        <FaPlus />
      </button>
    </div>
  );
};

export default MainContent;
   