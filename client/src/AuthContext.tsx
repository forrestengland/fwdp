import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // loading by default

  useEffect(() => {
    const tok = localStorage.getItem('token');
    if (tok) {

      // parse token
      const decoded = jwtDecode(tok);
      const userEmail = decoded.email;

      if (decoded.exp * 1000 > Date.now()) {
	setToken(tok);
	setUser({email: userEmail, id: decoded.userid});
      } else {
	setToken(null);
	localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (tok) => {
    localStorage.setItem('token', tok);
    const decoded = jwtDecode(tok);
    setToken(tok);
    setUser({email: decoded.email, id: decoded.userid});
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{user, loading, token, login, logout}}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => useContext(AuthContext);
