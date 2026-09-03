import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoutProps {
  token: string;
  onLogout: () => {};
}

export default function Logout({ token, onLogout }: LogoutProps) {

  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  function logoutUser() {
    localStorage.removeItem('token');
    setMessage('you are logged out');
    onLogout('Guest');
    navigate('/');
  }

  useEffect(() => {

    //    const token = localStorage.getItem('token');

    if (!token) {
      console.log('you are not logged in');
      navigate('/');
      return;
    }

  }, [token]);

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
