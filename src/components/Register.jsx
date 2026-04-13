import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://grocery-api-bkjp.onrender.com/api/auth/register", formData);
      alert("Registration Successful! Now please login.");
    } catch (err) {
      alert(err.response.data.message || "Registration Failed");
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" onChange={(e) => setFormData({...formData, name: e.target.value})} required /><br/><br/>
        <input type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} required /><br/><br/>
        <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} required /><br/><br/>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;