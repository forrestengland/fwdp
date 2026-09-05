import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiCall } from './Api.tsx';

export default function Dashboard() {

  const [message, setMessage] = useState('');
  const { user, token, loading, logout } = useAuth();

  async function fetchMessage() {

    if (user && token) {

      const apiArgs = {
	uri: "/api/auth/me",
	method: "GET",
	token: token,
	logout: logout // provide logout callback if the refresh token is revoked
      };
      let responseData = null;
      try {
	responseData = await apiCall(apiArgs);
	setMessage(responseData.message);
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
