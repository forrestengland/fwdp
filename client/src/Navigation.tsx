import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  token: string;
}

export default function Navigation({ token }: NavigationProps) {

  const { pathname } = useLocation();
  //  const [ token, setToken ] = useState(null);

  /*  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setToken(token);
    },[pathname]); */

  return (
    <>
      <div id="navigation" >
	<div className="nav-container">
      	<nav>
	  {!token && <Link to="/" className={pathname == '/' ? "nav-link-current" : "nav-link"}>Landing</Link>}
	  {!token && <Link to="/login" className={pathname == '/login' ? "nav-link-current" : "nav-link"}>Login</Link>}
	  {!token && <Link to="/register" className={pathname == '/register' ? "nav-link-current" : "nav-link"}>Register</Link>}

	  {token && <Link to="/dash" className={pathname == '/dash' ? "nav-link-current" : "nav-link"}>Dash</Link>}
	  {token && <Link to="/logout" className={pathname == '/logout' ? "nav-link-current" : "nav-link"}>Logout</Link>}
	  {token && <Link to="/health" className={pathname == '/health' ? "nav-link-current" : "nav-link"}>Health</Link>}
	</nav>
	</div>
      </div>
    </>
  );
}
