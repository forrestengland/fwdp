import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoutProps {
  onLogout: () => {};
}

export default function Logout({ onLogout }: LogoutProps) {

  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  function logoutUser() {
    localStorage.removeItem('token');
    setMessage('you are logged out');
    onLogout();
    navigate('/');
  }

  return (
    <>
      <div className="content-main">
	<div>{message}</div>
	<button onClick={logoutUser}>logout</button>
      </div>
    </>
  );
}
