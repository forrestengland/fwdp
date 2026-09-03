import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';
import './App.css';

import Navigation from './Navigation';
import ServerHealth from './ServerHealth.tsx';
import RegisterForm from './RegisterForm.tsx';
import LoginForm from './LoginForm.tsx';
import Logout from './Logout.tsx';
import Dashboard from './Dashboard';
import Landing from './Landing.tsx';
import EmailVerified from './EmailVerified.tsx';
import Profile from './Profile.tsx';

function App() {

  const [token, setToken] = useState('');
  const [username, setUsername] = useState('Guest');

  function loginStateChange(user) {
    setToken(localStorage.getItem('token'));
    setUsername(user);
  }

  return (
    <>
      <BrowserRouter>
	<Navigation token={token} user={username} />
	<Routes>
	  <Route path="/health" element={<ServerHealth />} />
	  <Route path="/register" element={<RegisterForm />} />
	  <Route path="/login" element={<LoginForm onLogin={loginStateChange} />} />
	  <Route path="/logout" element={<Logout onLogout={loginStateChange}/>} />
	  <Route path="/dash" element={<Dashboard />} />
	  <Route path="/email-verified" element={<EmailVerified />} />
	  <Route path="/profile" element={<Profile />} />	  
	  <Route path="/" element={<Landing />} />	  	  
	</Routes>
      </BrowserRouter>
    </>
  );
}

export default App
