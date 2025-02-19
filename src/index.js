import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { SupabaseProvider } from './context/SupabaseContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

console.log("index.js loaded"); // Added log

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SupabaseProvider>
      <App />
      <ToastContainer />
    </SupabaseProvider>
  </React.StrictMode>,
)
