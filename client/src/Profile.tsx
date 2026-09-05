/* profile page - change email, change password, delete account */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { apiCall } from './Api.tsx';

export default function Profile() {

  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordEmailConfirm, setPasswordEmailConfirm] = useState('');
  const [passwordChangeConfirm, setPasswordChangeConfirm] = useState('');
  const [passwordDeleteConfirm, setPasswordDeleteConfirm] = useState('');    
  const navigate = useNavigate();
  const { user, token, login, logout } = useAuth();

  async function confirmEmailChange(e: FormEvent) {

    e.preventDefault();

    if (!token || !user) return;

    console.log(`confirming email change from ${user} to ${email} with password ${passwordEmailConfirm}`);

    // send the email change request to the api server
    const apiArgs = {
      uri: "/api/auth/email-change",
      method: "PATCH",
      token: token,
      data: {email: user.email, password: passwordEmailConfirm, email_new: email},
      login: login,
      logout: logout
    };

    let responseData = null;

    try {
      responseData = await apiCall(apiArgs);
    } catch (error: any) {
      const msg = "error changing email";
      console.log(msg, error);
      setMessage(msg);
    }

    if (!responseData) {
      console.log("error: no response data from email change api call");
      setMessage("Incorrect response from server");
      return;
    }

    console.log('got email change response: ', responseData);
    setMessage(responseData.message);
    
  }

  async function confirmPasswordChange(e: FormEvent) {

    e.preventDefault();

    console.log(`confirming password change`);

    if (!token || !user) return;

    const apiArgs = {
      uri: "/api/auth/password-change",
      method: "POST",
      token: token,
      data: { email: user.email, password: passwordChangeConfirm, new_password: newPassword },
      login: login,
      logout: logout
    };

    let responseData = null;

    try {
      responseData = await apiCall(apiArgs);
    } catch(error: any) {
      const msg = "error changing password";
      console.log(msg, error);
      setMessage(msg);
    }

    if (!responseData) {
      console.log("error: no resonse data from password change request");
      setMessage("Incorrect Response from Server");
      return;
    }
    
    console.log('got password change response: ', responseData);
    setMessage(responseData.message);    
  }

  async function confirmDeleteAccount(e: FormEvent) {

    e.preventDefault();

    console.log('confirming account deletion');

    const apiArgs = {
      uri: "/api/auth/account-delete",
      method: "POST",
      token: token,
      data: { email: user?.email, password: passwordDeleteConfirm },
      login: login,
      logout: logout
    };

    let responseData = null;

    try {
      responseData = await apiCall(apiArgs);
    } catch (error: any) {
      const msg = "error deleting account";
      console.log(msg, error);
      setMessage(msg);
    }

    console.log('got account delete: ', responseData);
    setMessage(responseData.message);

    logout();
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
