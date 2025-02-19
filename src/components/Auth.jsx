import React, { useState, useContext } from 'react';
import { SupabaseContext } from '../context/SupabaseContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

console.log("Auth.jsx loaded"); // Added log

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { supabase, setSession, setUser } = useContext(SupabaseContext);
  const navigate = useNavigate();

  console.log("Auth.jsx rendering"); // Added log

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit function started"); // Added log
    try {
      if (isSignUp) {
        const { user, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          toast.error('Signup failed: ' + error.message);
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          setSession(session);
          setUser(user);
          navigate('/dashboard');
        }
      } else {
        const { user, session, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error('Sign in failed: ' + error.message);
        } else {
          setSession(session);
          setUser(user);
          navigate('/dashboard');
        }
      }
      console.log("handleSubmit function finished successfully"); // Added log
    } catch (error) {
      console.error('Authentication error: ' + error.message);
      toast.error('Authentication error: ' + error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>JobFit AI</h2>
      <p>{isSignUp ? 'Sign Up' : 'Welcome back'}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
      </form>
      <p>
        {isSignUp ? "Already have an account?" : "Don't have an account?"}
        <a href="#" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </a>
      </p>
    </div>
  );
}

export default Auth;
