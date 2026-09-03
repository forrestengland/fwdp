/* profile page - edit email, name, picture, delete profile */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProfileProps {
  user: string;
}

export default function Profile({ user }: ProfileProps) {

  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [newEmailSubmitted, setNewEmailSubmitted] = useState(true);
  const [passwordEmailConfirm, setPasswordEmailConfirm] = useState('');
  const navigate = useNavigate();

  async function confirmEmailChange(e: FormEvent) {

    e.preventDefault();

    console.log(`confirming email change from ${user} to ${email} with password ${passwordEmailConfirm}`);

    // send the email change request to the api server
    let resData = null;
    try {
      const response = await fetch('/api/auth/email-change', {
	method: 'PATCH',
	headers: {'Content-Type': 'application/json'},
	body: JSON.stringify({email: user, password: passwordEmailConfirm, email_new: email})
      });
      resData = await response.json();
    } catch (error: unknown) {
      console.log('error updating email');
    }
    console.log('got response: ', resData);
    setMessage(resData.message);
  }

  useEffect(() => {

    const token = localStorage.getItem('token');

    if (!token) {
      console.log('you are not logged in');
      navigate('/');
      return;
    }

  }, []);


  return (
    <>
	<div className="content-main">
	  <h1>Profile Page</h1>
	  <div className="message-container">{message}</div>
	  <form>
	    <div className="form-row">
	      <label>Change email:</label>
	      <input type="text" onChange={(e) => setEmail(e.target.value)} />
	    </div>
	    {newEmailSubmitted &&
	      <div className="form-row">
		<label>Enter password to confirm:</label>
		<input type="password" onChange={(e) => setPasswordEmailConfirm(e.target.value)} />
		<button type="submit" className="button-inline" onClick={confirmEmailChange}>Confirm</button>
	      </div>
            }

	  </form>
	</div>
    </>
  );
}
