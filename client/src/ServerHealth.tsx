import { useState, useEffect } from 'react';

export default function ServerStatus() {

  const [serverStatus, setServerStatus] = useState('');
  const [serverLastChecked, setServerLastChecked] = useState('');

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });

  function updateServerStatus(event) {
    fetch('/api/health').then(response => {
      if (!response.ok) throw new Error('network response not ok');
      return response.json();
    }).then(data => {
      setServerStatus(data.status);
      const rawDate = data.timestamp;
      setServerLastChecked(dateFormatter.format(new Date(rawDate)));
      console.log('data rxd:', data);
    }).catch(error => {
      console.error('fetch error:', error);
      setServerStatus('DOWN');
      setServerLastChecked(dateFormatter.format(new Date()));
    });
  }

  useEffect(() => {
    updateServerStatus();
  }, []);
  
  return (
    <>
    <div className="content-main">
      <span>server status: {serverStatus} {serverStatus === 'UP' ? <span>🙂</span> : <span>🙁</span>}</span><br />
      <span>last checked: {serverLastChecked} </span><br />    
      <button onClick={updateServerStatus}>check</button>
    </div>
    </>
  );
}
