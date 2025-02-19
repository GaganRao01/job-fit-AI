import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SupabaseContext } from '../context/SupabaseContext';
import DashboardHeader from './DashboardHeader'; // Import the header

console.log("SearchResults.jsx loaded");

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchResults } = location.state || { searchResults: [] }; // Get searchResults from location state
  const { supabase } = useContext(SupabaseContext);

  console.log("SearchResults.jsx rendering, searchResults:", searchResults);

  const handleGoBack = () => {
    navigate('/dashboard'); // Navigate back to the home page
  };

  const handleJobCardClick = (job) => {
    navigate(`/job/${job.id}`);
  };

  return (
    <div>
      <DashboardHeader /> {/* Include the header */}
      <div className="search-container">
        <h1>Search Results</h1>
        <button onClick={handleGoBack}>Back to Home</button>
        {searchResults && searchResults.length > 0 ? (
          searchResults.map((job, index) => (
            <div key={index} className="job-card" onClick={() => handleJobCardClick(job)}>
              <h3>{job['job title']}</h3>
              <p><strong>Company:</strong> {job.company}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p>{job.description?.substring(0, 100)}...</p>
            </div>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
}

export default SearchResults;
