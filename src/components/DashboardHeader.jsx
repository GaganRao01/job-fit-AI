import React, { useState, useContext } from 'react';
import { SupabaseContext } from '../context/SupabaseContext';
import { useNavigate } from 'react-router-dom';

console.log("DashboardHeader.jsx loaded");

function DashboardHeader({ onUploadResumeClick }) {
  const { supabase, session, user } = useContext(SupabaseContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get initial dark mode state from localStorage or default to false
    const storedDarkMode = localStorage.getItem('darkMode');
    return storedDarkMode ? JSON.parse(storedDarkMode) : false;
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchInputKeyPress = async (e) => {
    if (e.key === 'Enter') {
      // Perform the search and navigate to the results page
      const query = supabase
        .from('jobs')
        .select('*')
        .or(`"job title".ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`);

      try {
        const { data, error } = await query;
        if (error) {
          console.error('Error searching jobs:', error);
        } else {
          navigate('/search-results', { state: { searchResults: data } });
        }
      } catch (error) {
        console.error('Error during search:', error);
      }
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode)); // Store in localStorage
    document.body.classList.toggle('dark-mode', newDarkMode); // Toggle class on body
  };

  return (
    <header className="dashboard-header">
      <h1>SmartHire AI</h1>
      <nav>
        <button onClick={onUploadResumeClick}>Upload Resume</button>
        <a href="#">Job Insights</a>
        <input
          type="text"
          placeholder="Search companies, job titles..."
          value={searchQuery}
          onChange={handleSearchInputChange}
          onKeyPress={handleSearchInputKeyPress}
        />
        <select>
          <option>City</option>
        </select>
        <button onClick={handleSignOut}>Sign Out</button>
        <button onClick={toggleDarkMode}>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </nav>
    </header>
  );
}

export default DashboardHeader;
