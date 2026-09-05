import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { apiCall } from './Api.tsx';

export default function Logout() {

  const [message, setMessage] = useState('');
  const { login, logout, token } = useAuth();

  const navigate = useNavigate();

  async function logoutUser() {

    const apiArgs = {
      uri: '/api/auth/logout',
      method: 'POST',
      data: {logout: true},
      token: token,
      login: login,
      logout: logout
    };

    try {
      await apiCall(apiArgs);
    } catch (e: any) {
      const msg = 'error logging out';
      console.log(msg, e);
      setMessage(msg);
      return;
    }

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
