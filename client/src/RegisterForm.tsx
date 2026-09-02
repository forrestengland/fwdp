import { useState } from 'react';

export default function RegisterForm() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    console.log(`submitting registration: email = ${email}, password = ${password}`);
    fetch('/api/auth/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: email, password: password})
    }).then(response => {
      if (!response.ok) throw new Error('network response not ok');
      return response.json();
    }).then(data => {
      console.log('data rxd', data);
      if (data.status == 'ok') {
	setMessage('account creation successful! Login to continue');
      } else {
	setMessage('failed to create account');
      }
    }).catch(error => {
      console.log('fetch error:', error);
      setMessage('error creating account');
    });
  }
  
  return (
    <>
      <div className="content-main">
	<span>Register</span> <span>{message}</span>
	<form onSubmit={handleSubmit}>
	  <div className="form-row">
	    <label>email:</label>
	    <input type="text" onChange={(e) => setEmail(e.target.value)}required />
	  </div>
	  <div className="form-row">
	    <label>password:</label>
	    <input type="password" onChange={(e) => setPassword(e.target.value)}required />
	  </div>
	  <button type="submit" onClick={handleSubmit}>Submit</button>
	</form>
      </div>
    </>
  );
}
