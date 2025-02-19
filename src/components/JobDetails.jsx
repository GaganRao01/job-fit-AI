import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SupabaseContext } from '../context/SupabaseContext';

console.log("JobDetails.jsx loaded"); // Added log

function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const { supabase } = useContext(SupabaseContext);
  const navigate = useNavigate();

  console.log("JobDetails.jsx rendering, id:", id); // Added log

  useEffect(() => {
    console.log("JobDetails useEffect started"); // Added log
    const fetchJobDetails = async () => {
      console.log("fetchJobDetails function started"); // Added log
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();
        if (error) {
          console.error('Error fetching job details:', error);
        } else {
          setJob(data);
        }
        console.log("fetchJobDetails function finished"); // Added log
      } catch (error) {
        console.error('Error fetching job details:', error);
      }
    };

    fetchJobDetails();
    console.log("JobDetails useEffect finished"); // Added log
  }, [id, supabase]);

  const handleTailorResume = () => {
    console.log('Tailor resume clicked for job:', job);
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  if (!job) {
    return <div>Loading...</div>;
  }

  return (
    <div className="job-details-container">
      <button onClick={handleGoBack}>Back</button>
      <h2>{job.title}</h2>
      <p><strong>Company:</strong> {job.company}</p>
      <p><strong>Location:</strong> {job.location}</p>
      <p><strong>Salary:</strong> {job.salary}</p>
      <p><strong>Experience Required:</strong> {job.experience}</p>
      <p><strong>Description:</strong> {job.description}</p>
      <p><strong>Qualifications:</strong> {job.qualifications}</p>
      <button onClick={handleTailorResume}>Tailor Resume</button>
    </div>
  );
}

export default JobDetails;
