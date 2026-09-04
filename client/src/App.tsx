import { BrowserRouter, Routes, Route } from 'react-router-dom';

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

  return (
    <>
      <BrowserRouter>
	<AuthProvider>
	  <Navigation />
	  <Routes>
	    <Route path="/" element={<Landing />} />	  	  
	    <Route path="/register" element={<RegisterForm />} />
	    <Route path="/login" element={<LoginForm />} />
	    <Route path="/email-verified" element={<EmailVerified />} />	  
	    <Route path="/health" element={<ServerHealth />} />
	  
	    <Route path="/dash" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
	    <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />	  
	    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

	    <Route path="/todo" element={<ProtectedRoute><Todos /></ProtectedRoute>} />

	  </Routes>
	</AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App
