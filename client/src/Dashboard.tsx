import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export default function Dashboard() {

  const [message, setMessage] = useState('');
  const { user, token, loading, logout } = useAuth();

  async function fetchMessage() {

    if (user && token) {

      try {
	const response = await fetch('/api/auth/me', {
	  method: 'GET',
	  headers: {
	    'Authorization': `Bearer ${token}`,
	    'Content-Type': 'application/json'
	  },
	});

	if (response.status == 401 || response.status == 403) {
	  throw new Error('Session expired. please log in again');
	  logout();
	}

	const result = await response.json();
	setMessage(result.message);
      } catch (err: any) {
	setMessage(err.message);
      }
    }
  }

  useEffect(() => {

    if (!loading)
      fetchMessage();
    
  }, [loading]);


  return (
    <>
      <h1>Dashboard</h1>
      <div className="content-main">
	<div className="message-container">{message}</div>
      </div>
    </>
  );
}
