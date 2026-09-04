import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Navigation() {

  const [username, setUsername] = useState('Guest');
  const { pathname } = useLocation();
  const { user, loading, token } = useAuth();

  // update user state text on json web token (jwt) change (logged in state)
  useEffect(() => {
    if (!loading) {
      if (user) {
	setUsername(user.email);
      } else {
	setUsername('Guest');
      }
    }
  }, [loading, user]);

  return (
    <>
      <div id="navigation" >
	<div className="nav-container">
      	<nav>
	  {!token && <Link to="/" className={pathname == '/' ? "nav-link-current" : "nav-link"}>Landing</Link>}
	  {!token && <Link to="/login" className={pathname == '/login' ? "nav-link-current" : "nav-link"}>Login</Link>}
	  {!token && <Link to="/register" className={pathname == '/register' ? "nav-link-current" : "nav-link"}>Register</Link>}

	  {token && <Link to="/dash" className={pathname == '/dash' ? "nav-link-current" : "nav-link"}>Dash</Link>}
	  {token && <Link to="/todo" className={pathname == '/todo' ? "nav-link-current" : "nav-link"}>ToDo</Link>}	  
	  {token && <Link to="/profile" className={pathname == '/profile' ? "nav-link-current" : "nav-link"}>Profile</Link>}
	  {token && <Link to="/logout" className={pathname == '/logout' ? "nav-link-current" : "nav-link"}>Logout</Link>}
	</nav>
	  <span className="user-status">Hello, {username}</span>
	</div>
      </div>
    </>
  );
}
