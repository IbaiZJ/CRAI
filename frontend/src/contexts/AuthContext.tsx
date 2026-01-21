import React, { createContext, useContext, useState } from 'react';
import { authApi, type RegisterRequest } from '@/lib/api';
import { getCookie, setCookie, deleteCookie } from '@/lib/cookies';

interface AuthUser {
  username: string;
  name: string;
  surname?: string;
  fullName: string;
  email?: string;
  picture?: string;
  sub: string;
  iat?: number; // Emission time
  exp?: number; // Expiration time
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// JSON Web Token decoded structure
interface DecodedToken {
  username: string;
  name: string;
  surname: string;
  exp: number;
  iat: number;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Try to get from cookies first, then localStorage
    const cookieUser = getCookie('user');
    const cookieToken = getCookie('token');
    
    const storedUser = cookieUser || localStorage.getItem('user');
    const token = cookieToken || localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        deleteCookie('user');
        deleteCookie('token');
      }
    }
    return null;
  });

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting login for:', username);
      
      const response = await authApi.login({ username, password });
      
      console.log('Login response:', response);
      
      if (response.success && response.token && response.user) {
        const userData: AuthUser = {
          username: response.user.username,
          name: response.user.name,
          surname: response.user.surname,
          fullName: `${response.user.name} ${response.user.surname}`.trim(),
          email: response.user.email,
          picture: response.user.picture,
          sub: response.user.username,
        };
        
        setUser(userData);
        
        // Save to both localStorage and cookies for persistence
        const userJSON = JSON.stringify(userData);
        localStorage.setItem('user', userJSON);
        localStorage.setItem('token', response.token);
        
        // Cookies will persist for 7 days
        setCookie('user', userJSON, 7);
        setCookie('token', response.token, 7);
        
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const register = async (data: RegisterRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.register(data);
      
      if (response.success) {
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Registration failed' };
    } catch (error) {
      console.error('Error registering:', error);
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    
    // Clear both localStorage and cookies
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    deleteCookie('user');
    deleteCookie('token');
  };

  const contextValue = React.useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }), [user]);

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
