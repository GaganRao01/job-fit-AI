import React, { createContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

console.log("SupabaseContext.jsx loaded"); // Added log

const SupabaseContext = createContext();

const supabaseUrl = 'https://eunxcwqjdqqawdijxzcl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bnhjd3FqZHFxYXdkaWp4emNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MDA1NTQsImV4cCI6MjA1Mzk3NjU1NH0.F-ubLjdEpyncv_SQqgZ7nysoITUlDgQtBhwYxUvd9tk';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bnhjd3FqZHFxYXdkaWp4emNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQwMDU1NCwiZXhwIjoyMDUzOTc2NTU0fQ.zSyXlZypQCRAiVy6WdT3hxGws16_19lmGiWDfrvNN_k';

// Choose the appropriate key based on the context
let supabaseKey = supabaseAnonKey;


const supabase = createClient(supabaseUrl, supabaseKey);

const SupabaseProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    console.log("SupabaseContext useEffect started"); // Added log
    const fetchSession = async () => {
      console.log("fetchSession function started"); // Added log
      setIsLoading(true); // Set loading to true at the start
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false); // Set loading to false after session is fetched
      console.log("fetchSession function finished"); // Added log
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  console.log("SupabaseContext useEffect finished"); // Added log

  const value = {
    supabase,
    session,
    user,
    setSession,
    setUser,
    isLoading // Expose loading state
  };

  return (
    <SupabaseContext.Provider value={value}>
      {!isLoading ? children : <div>Loading...</div>} {/* Conditionally render children */}
    </SupabaseContext.Provider>
  );
};

export { SupabaseContext, SupabaseProvider };
