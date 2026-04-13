import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://grocery-api-bkjp.onrender.com/api/auth/login", loginData);
      
      // THIS IS THE MAGIC PART: Save the token in the browser!
      localStorage.setItem('token', res.data.token);
      
      alert("Login Successful!");
      navigate('/dashboard'); // This will send us to the grocery list
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} required /><br/><br/>
        <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} required /><br/><br/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;