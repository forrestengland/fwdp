// auth provider context - handles user session state
// don't store token in localStorage - insecure
// store in memory and use refresh token to keep logged in

import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { refreshToken } from './Api.tsx';

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

  // code to run when page finishes loading
  useEffect(() => {

    const checkToken = async () => {
    
      let newToken = '';
      
      try {
	newToken = await refreshToken(login, logout);
      } catch (e: any) {
	console.log("error refreshing token", e);
	setToken('');
	return;
      }

      login(newToken);
      
      console.log("token refresh successful");
	
      setLoading(false);
      
    };

    checkToken();
    
  }, []);

  const login = (tok: string) => {
    
    const decoded = jwtDecode<AuthPayload>(tok);
    
    setToken(tok);
    
    setUser({email: decoded.email, userId: decoded.userId});
  };

  const logout = () => {

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
