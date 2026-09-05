/* profile page - change email, change password, delete account */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Profile() {

  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordEmailConfirm, setPasswordEmailConfirm] = useState('');
  const [passwordChangeConfirm, setPasswordChangeConfirm] = useState('');
  const [passwordDeleteConfirm, setPasswordDeleteConfirm] = useState('');    
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  async function confirmEmailChange(e: FormEvent) {

    e.preventDefault();

    if (!token || !user) return;

    console.log(`confirming email change from ${user} to ${email} with password ${passwordEmailConfirm}`);

    // send the email change request to the api server
    let resData = null;
    try {
      const response = await fetch('/api/auth/email-change', {
	method: 'PATCH',
	headers: {
	  'Authorization': `Bearer ${token}`,
	  'Content-Type': 'application/json'
	},
	body: JSON.stringify({email: user.email, password: passwordEmailConfirm, email_new: email})
      });
      resData = await response.json();
      if (response.status == 401 || response.status == 403) {
	setMessage('Session expired. please log in again');
	logout();
	return;
      }
    } catch (error: unknown) {
      console.log('error updating email');
      setMessage('Error changing email address');
    }
    console.log('got response: ', resData);
    setMessage(resData.message);
  }

  async function confirmPasswordChange(e: FormEvent) {

    e.preventDefault();

    console.log(`confirming password change`);

    if (!token || !user) return;
    
    let resData = null;
    try {
      const response = await fetch('/api/auth/password-change', {
	method: 'POST',
	headers: {
	  'Authorization': `Bearer ${token}`,
	  'Content-Type': 'application/json'
	},
	body: JSON.stringify({ email: user.email, password: passwordChangeConfirm, new_password: newPassword })
      });
      resData = await response.json();
      if (response.status == 401 || response.status == 403) {
	setMessage('Session expired. please log in again');
	logout();
	return;
      }
    } catch (error: unknown) {
      console.log('error changing password');
      setMessage('Error changing password');
    }

    console.log('got password change response: ', resData);
    setMessage(resData.message);    
  }

  async function confirmDeleteAccount(e: FormEvent) {

    e.preventDefault();

    console.log('confirming account deletion');

    if (!token || !user) return;
    
    let resData = null;
    try {
      const response = await fetch('/api/auth/account-delete', {
	method: 'POST',
	headers: {
	  'Authorization': `Bearer ${token}`,
	  'Content-Type': 'application/json'
	},
	body: JSON.stringify({ email: user.email, password: passwordDeleteConfirm })
      });
      if (response.status == 401 || response.status == 403) {
	setMessage('Session expired. please log in again');
	logout();
	return;
      }
      resData = await response.json();
    } catch (error: unknown) {
      console.log('error deleting account');
      setMessage('Error deleting account');
    }

    console.log('got account delete: ', resData);
    setMessage(resData.message);

    // account was deleted, log them out
    logout();
    //    localStorage.removeItem('token');
    //    onLogout('Guest');
    navigate('/');
    
  }  

  return (
    <>
	<div className="content-main">
	  <h1>Profile Page</h1>
	  {message && <div className="message-container">{message}</div>}
	  <div className="form-container">
	    <h2>Change Email Address</h2>
	    <form>
	    <div className="form-row">
	      <label>Change email:</label>
	      <input type="text" name="newEmail" onChange={(e) => setEmail(e.target.value)} />
	    </div>
	      <div className="form-row">
		<label>Enter password to confirm:</label>
		<input type="password" autoComplete="new-password" onChange={(e) => setPasswordEmailConfirm(e.target.value)} />
		<button type="submit" className="button-inline" onClick={confirmEmailChange}>Confirm</button>
	      </div>

	    </form>
	  </div>

	  <div className="form-container">
	    <h2>Change Password</h2>
	    <form>
	    <div className="form-row">
	      <label>Change password:</label>
	      <input type="password" autoComplete="new-password" onChange={(e) => setNewPassword(e.target.value)} />
	    </div>
	      <div className="form-row">
		<label>Enter old password to confirm:</label>
		<input type="password" onChange={(e) => setPasswordChangeConfirm(e.target.value)} />
		<button type="submit" className="button-inline" onClick={confirmPasswordChange}>Confirm</button>
	      </div>
	    </form>
	  </div>

	  <div className="form-container">
	    <h2>Delete Account</h2>
	    <form>
	      <div className="form-row">
		<label>Enter old password to confirm:</label>
		<input type="password" autoComplete="new-password" onChange={(e) => setPasswordDeleteConfirm(e.target.value)} />
		<button type="submit" className="button-inline" onClick={confirmDeleteAccount}>Confirm</button>
	      </div>
	    </form>
	  </div>

	</div>
    </>
  );
}
