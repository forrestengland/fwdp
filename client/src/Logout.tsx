import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Logout() {

  const [message, setMessage] = useState('');
  const { logout } = useAuth();

  const navigate = useNavigate();

  function logoutUser() {
    logout();
    setMessage('you are logged out');
    navigate('/');
  }

  return (
    <>
      <h1>Log Out</h1>
      <div className="content-main">
	{message && <div>{message}</div>}
	<div className="form-container">
	  <button className="button-submit" onClick={logoutUser}>logout</button>
	</div>
      </div>
    </>
  );
}
