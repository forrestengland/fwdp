import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function fetchMessage() {

    const token = localStorage.getItem('token');

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
      }

      const result = await response.json();
      setMessage(result.message);
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  useEffect(() => {

    const token = localStorage.getItem('token');

    if (!token) {
      console.log('you are not logged in');
      navigate('/');
      return;
    }

    fetchMessage();
  }, []);


  return (
    <>
      <div className="content-main">
	<div>{message}</div>
	{/*	<button onClick={fetchMessage}>get message</button> */}
      </div>
    </>
  );
}
