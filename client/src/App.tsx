import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import './App.css';

import {AuthProvider} from './AuthContext';
import {ProtectedRoute} from './ProtectedRoute';

import Navigation from './Navigation';
import ServerHealth from './ServerHealth.tsx';
import RegisterForm from './RegisterForm.tsx';
import LoginForm from './LoginForm.tsx';
import Logout from './Logout.tsx';
import Dashboard from './Dashboard';
import Landing from './Landing.tsx';
import EmailVerified from './EmailVerified.tsx';
import Profile from './Profile.tsx';
import Todos from './Todos.tsx';

function App() {

  const [token, setToken] = useState('');
  const [username, setUsername] = useState('Guest');
  const [loading, setLoading] = useState(true);

  function loginStateChange(user) {
    setToken(localStorage.getItem('token'));
    setUsername(user);
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
	const decoded = jwtDecode(token);
	const userEmail = decoded.email;
	setUsername(userEmail)
	setToken(token);
      } catch (error) {
	console.log('invalid token structure:', error);
      }
    }
    setLoading(false);
  }, []);

  return (
    <>
      <BrowserRouter>
	<AuthProvider>
	  <Navigation token={token} user={username} />
	  <Routes>
	    <Route path="/" element={<Landing />} />	  	  
	    <Route path="/register" element={<RegisterForm />} />
	    <Route path="/login" element={<LoginForm onLogin={loginStateChange} />} />
	    <Route path="/email-verified" element={<EmailVerified />} />	  
	    <Route path="/health" element={<ServerHealth />} />
	  
	    <Route path="/dash" element={<ProtectedRoute><Dashboard token={token} /></ProtectedRoute>} />
	    <Route path="/logout" element={<ProtectedRoute><Logout onLogout={loginStateChange} token={token} /></ProtectedRoute>} />	  
	    <Route path="/profile" element={<ProtectedRoute><Profile user={username} token={token} onLogout={loginStateChange} /></ProtectedRoute>} />

	    <Route path="/todo" element={<ProtectedRoute><Todos token={token} loading={loading}/></ProtectedRoute>} />

	  </Routes>
	</AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App
