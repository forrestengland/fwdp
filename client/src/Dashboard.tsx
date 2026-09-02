import { useState, useEffect } from 'react';

export default function Dashboard() {

  const [message, setMessage] = useState('');

  async function fetchMessage() {

    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('you are not logged in');
      return;
    }

    try {
      const response = await fetch('/api/me', {
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
