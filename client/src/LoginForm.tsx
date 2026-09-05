import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { apiCall } from './Api.tsx';

export default function LoginForm() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // find out if they were redirected here trying to access a protected page
  const from = location.state?.from?.pathname || "/dash"; // redirect to dash by default

  // handle submission of the login form
  async function handleSubmit(e: FormEvent) {

    // don't do the normal form post
    e.preventDefault();

    console.log(`submitting login: email = ${email}, password = ${password}`);

    // submit the login request
    const apiArgs = {
      uri: "/api/auth/login",
      method: "POST",
      data: {email: email, password: password}
    };

    // place to put api call response body
    let responseData =null;

    // make the api call
    try {
      responseData = await apiCall(apiArgs);
    } catch (err: any) {
      console.log('error logging in: ', err);
      setMessage('Error logging in');
      return;
    }

    // check status and set token if success
    if (responseData.status == 'ok') {
	console.log('got token: ', responseData.token);
	login(responseData.token); // set the access token in the AuthProvider context
	navigate(from, {replace:true});
    } else {
      setMessage('Error logging in');
      return;
    }
  }
  
  return (
    <>
      <div className="content-main">
	<h1>Login</h1>
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
