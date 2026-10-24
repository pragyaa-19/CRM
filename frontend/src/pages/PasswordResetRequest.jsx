import React, { useState } from 'react';
import axios from 'axios';

export default function PasswordResetRequest() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/password_reset/', { email });
      setMessage('If your email exists in our system, a reset link has been sent.');
    } catch (err) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <h2>Reset Your Password</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Enter your email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <button type="submit">Send Reset Link</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
