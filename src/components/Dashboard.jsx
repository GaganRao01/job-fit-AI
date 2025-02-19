import React, { useState, useEffect, useContext } from 'react';
import { SupabaseContext } from '../context/SupabaseContext';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import DashboardHeader from './DashboardHeader'; // Import the header

console.log("Dashboard.jsx loaded"); // Added log

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [jobData, setJobData] = useState([]);
  const { supabase, session, user, isLoading } = useContext(SupabaseContext);
  const [chartData, setChartData] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [networkData, setNetworkData] = useState(null);

  console.log("Dashboard.jsx rendering"); // Added log

  useEffect(() => {
    console.log('useEffect hook started in Dashboard.jsx');
    const fetchJobData = async () => {
      console.log('fetchJobData function started in Dashboard.jsx');
      const query = supabase
        .from('jobs') // Table name is 'jobs'
        .select('id, job title, company, location, job_url, description, skills'); // Correct column names
      console.log('Supabase query about to execute:', query); // Log query before execution
      try {
        const { data, error } = await query;
        if (error) {
          console.error('Error fetching job data in Dashboard.jsx:', error);
          console.error('Supabase error object in Dashboard.jsx:', error); // Log full error object
          toast.error('Error fetching job data.');
        } else {
          console.log('Job data fetched successfully in Dashboard.jsx:', data);
          console.log('Supabase data object in Dashboard.jsx:', data); // Log full data object
          setJobData(data);
          processChartData(data);
          processNetworkData(data);
        }
      } catch (error) {
        console.error('Error in try/catch block of fetchJobData in Dashboard.jsx:', error); // Catch block error
        toast.error('Error fetching job data.');
      }
    };

    fetchJobData();
    console.log('useEffect hook finished in Dashboard.jsx');

    // Load dark mode preference from localStorage
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode === 'true') {
      document.body.classList.add('dark-mode');
    }
  }, [supabase]);

  const processChartData = (data) => {
    console.log('processChartData function started in Dashboard.jsx');
    const skillCounts = {};
    data.forEach(job => {
      if (job.skills) {
        job.skills.forEach(skill => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });

    const labels = Object.keys(skillCounts);
    const counts = Object.values(skillCounts);

    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Skill Counts',
          data: counts,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });
    console.log('processChartData function finished in Dashboard.jsx');
  };

  const processNetworkData = (data) => {
    console.log('processNetworkData function started in Dashboard.jsx');
    const nodes = [];
    const edges = [];
    const skillMap = {};

    data.forEach(job => {
      if (job.skills) {
        job.skills.forEach(skill => {
          if (!skillMap[skill]) {
            skillMap[skill] = { id: skill, label: skill };
            nodes.push(skillMap[skill]);
          }
        });

        for (let i = 0; i < job.skills.length; i++) {
          for (let j = i + 1; j < job.skills.length; j++) {
            const source = job.skills[i];
            const target = job.skills[j];
            const edgeId = `${source}-${target}`;
            const reverseEdgeId = `${target}-${source}`;

            if (!edges.find(edge => edge.id === edgeId || edge.id === reverseEdgeId)) {
              edges.push({ id: edgeId, source: source, target: target });
            }
          }
        }
      }
    });

    setNetworkData({ nodes, edges });
    console.log('processNetworkData function finished in Dashboard.jsx');
  };

  const handleUploadResumeClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.error('No file selected');
      toast.error('Please select a file to upload.');
      return;
    }

    if (!user) {
      console.error('User is not authenticated.');
      toast.error('Please sign in to upload a resume.');
      return;
    }

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        toast.error('Error uploading resume.');
      } else {
        console.log('File uploaded successfully:', data);
        toast.success('Resume uploaded successfully!');
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading resume.');
    }
  };

  const handleJobCardClick = (job) => {
    navigate(`/job/${job.id}`);
  };

  console.log('Before return statement in Dashboard.jsx');

  // Conditionally render based on loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader onUploadResumeClick={handleUploadResumeClick} />
      <div className="dashboard-title">
        <h2>JobFit AI</h2>
        <p>Find Your Perfect Job Match with AI-Powered Resume Tailoring</p>
      </div>
      {isModalOpen && (
        <div className="upload-resume-modal">
          <div className="upload-resume-modal-content">
            <h2>Upload Resume</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            <button onClick={handleCloseModal}>Cancel</button>
          </div>
        </div>
      )}
      {chartData && (
        <div className="chart-container">
          <Chart type='bar' data={chartData} />
        </div>
      )}
      {networkData && (
        <div className="cytoscape-container">
          <CytoscapeComponent
            elements={networkData}
            style={{ width: '100%', height: '100%' }}
            stylesheet={[
              {
                selector: 'node',
                style: {
                  'background-color': '#61dafb',
                  'label': 'data(label)',
                  'color': '#2d3748',
                  'font-size': '12px',
                  'text-valign': 'center',
                  'text-halign': 'center',
                  'text-wrap': 'wrap',
                  'text-max-width': '80px',
                  'padding': '10px'
                }
              },
              {
                selector: 'edge',
                style: {
                  'width': 1,
                  'line-color': '#a0aec0',
                  'curve-style': 'bezier',
                  'target-arrow-color': '#a0aec0',
                  'target-arrow-shape': 'triangle'
                }
              }
            ]}
            layout={{ name: 'cose' }}
          />
        </div>
      )}
      <h2>AI Job Insights</h2>
      {jobData.map((job, index) => (
        <div key={index} className="job-card" onClick={() => handleJobCardClick(job)}>
          <h3>{job['job title']}</h3> {/* Correct column name */}
          <p><strong>Company:</strong> {job.company}</p>
          <p><strong>Location:</strong> {job.location}</p>
          {job.min_amount && job.max_amount && (
            <p>
              <strong>Salary:</strong> {job.min_amount} - {job.max_amount}
            </p>
          )}
          <p>{job.description?.substring(0, 100)}...</p>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
