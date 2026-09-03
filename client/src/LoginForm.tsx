import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onLogin: (user) => {};
}

export default function LoginForm({ onLogin }: LoginFormProps) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  // handle submission of the login form
  function handleSubmit(e: FormEvent) {

    // don't do the normal form post
    e.preventDefault();

    console.log(`submitting login: email = ${email}, password = ${password}`);

    // submit the login request
    fetch('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: email, password: password})
    }).then(response => {
      if (!response.ok) throw new Error('network response not ok');
      return response.json();
    }).then(data => {

      console.log('data rxd', data);

      if (data.status == 'ok') {

	setMessage('account login successful');

	console.log('got token: ', data.token);
	localStorage.setItem('token', data.token);

	onLogin(email);

	navigate('/dash');
	
      } else {
	setMessage('failed to login');
      }
    }).catch(error => {
      console.log('fetch error:', error);
      setMessage('error logging in, is your email verified?');
    });
  }
  
  return (
    <>
      <div className="content-main">
	<span>Login</span> <span>{message}</span>
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
