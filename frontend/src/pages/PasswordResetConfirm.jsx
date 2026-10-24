import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PasswordResetConfirm() {
  const { token } = useParams(); // Grabs token from URL route
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/password_reset/confirm/', {
        token: token,
        password: password
      });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setMessage('Token expired or invalid. Please request a new link.');
    }
  };

  return (
    <div>
      <h2>Enter New Password</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="password" 
          placeholder="New Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Confirm Reset</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
