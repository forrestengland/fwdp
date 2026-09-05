import { useState, type FormEvent } from 'react';
import { apiCall } from './Api.tsx';
import { useAuth } from './AuthContext';

export default function RegisterForm() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const { token, login, logout } = useAuth();

  async function handleSubmit(e: FormEvent) {

    e.preventDefault();

    console.log(`submitting registration: email = ${email}, password = ${password}`);

    const apiArgs = {
      uri: "/api/auth/register",
      method: "POST",
      data: {email: email, password: password},
      token: token,
      login: login,
      logout: logout
    };

    let responseData = null;

    try {
      responseData = await apiCall(apiArgs);
    } catch (err: any) {
      const message = "Error registering in";
      console.log(message, err);
      setMessage(message);
    }
    
    if (responseData.status == 'ok') {
      setMessage('account creation successful! Check your email');
    } else {
      setMessage('failed to create account');
    }
  }
  
  return (
    <>
      <div className="content-main">
	<h1>Register</h1>
	<div>{message}</div>
	<div className="form-container">
	  <form onSubmit={handleSubmit}>
	    <div className="form-row">
	      <label>email:</label>
	      <input type="text" onChange={(e) => setEmail(e.target.value)}required />
	    </div>
	    <div className="form-row">
	      <label>password:</label>
	      <input type="password" onChange={(e) => setPassword(e.target.value)}required />
	    </div>
	    <button className="button-submit" type="submit" onClick={handleSubmit}>Submit</button>
	  </form>
	</div>
      </div>
    </>
  );
}
