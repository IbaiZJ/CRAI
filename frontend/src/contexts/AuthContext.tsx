import React, { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { SpinnerCustom } from "@/components/Spinner";

interface User {
  email: string;
  name: string;
  surname?: string;
  fullName: string;
  picture?: string;
  sub: string;
  email_verified?: boolean;
  locale?: string;
  iat?: number; // Emission time
  exp?: number; // Expiration time
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credential: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// JSON Web Token decoded structure
interface DecodedToken {
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  sub: string;
  email_verified?: boolean;
  locale?: string;
  exp: number;
  iat: number;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.exp * 1000 > Date.now()) {
          return JSON.parse(storedUser);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    return null;
  });
  const loading = false;

  const login = (credential: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(credential);
      const userData: User = {
        email: decoded.email,
        name: decoded.given_name || decoded.name.split(' ')[0],
        surname: decoded.family_name || decoded.name.split(' ').slice(1).join(' '),
        fullName: decoded.name,
        picture: decoded.picture,
        sub: decoded.sub,
        email_verified: decoded.email_verified,
        locale: decoded.locale,
        iat: decoded.iat,
        exp: decoded.exp,
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', credential);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const contextValue = React.useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  }), [user, login, logout, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <SpinnerCustom />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
