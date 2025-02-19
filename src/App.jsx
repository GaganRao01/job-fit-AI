import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import JobSearch from './components/JobSearch';
import JobDetails from './components/JobDetails';
import Auth from './components/Auth';
import ResumeTailor from './components/ResumeTailor';
import { SupabaseContext } from './context/SupabaseContext';
import SearchResults from './components/SearchResults'; // Import SearchResults component

console.log("App.jsx loaded"); // Added log

function App() {
  const { session } = useContext(SupabaseContext);
  console.log("App.jsx rendering, session:", session); // Added log

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} /> {/* Auth is the initial route */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<JobSearch />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/tailor" element={<ResumeTailor />} />
        <Route path="/search-results" element={<SearchResults />} /> {/* Add SearchResults route */}
      </Routes>
    </Router>
  );
}

export default App;
