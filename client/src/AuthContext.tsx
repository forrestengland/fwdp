import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

interface AuthPayload extends JwtPayload {
  email: string;
  userId: string;
}

interface AuthContextType {
  loading: boolean;
  user: AuthPayload | null;
  token: string;
  login: (tok: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {

  const [user, setUser] = useState<AuthPayload | null>(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true); // loading by default

  useEffect(() => {
    const tok = localStorage.getItem('token');
    if (tok) {

      // parse token
      const decoded = jwtDecode<AuthPayload>(tok);
      const userEmail = decoded.email;

      if (!decoded.exp) {
	setLoading(false);
	return;
      }

      if (decoded.exp * 1000 > Date.now()) {
	setToken(tok);
	setUser({email: userEmail, userId: decoded.userId});
      } else {
	setToken('');
	localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (tok: string) => {
    localStorage.setItem('token', tok);
    const decoded = jwtDecode<AuthPayload>(tok);
    setToken(tok);
    setUser({email: decoded.email, userId: decoded.userId});
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken('');
  };

  return (
    <AuthContext.Provider value={{user, loading, token, login, logout}}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {

  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
