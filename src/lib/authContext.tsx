'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  tokens: { accessToken: string } | null;
  login: (accessToken: string) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<{ accessToken: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to indicate initial load

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  const login = (accessToken: string) => {
    const newTokens = { accessToken };
    setTokens(newTokens);
    localStorage.setItem('tokens', JSON.stringify(newTokens));
    console.log('Auth - Tokens stored:', newTokens);
  };

  const logout = async () => {
    try {
      if (tokens?.accessToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });
        console.log('Auth - Logout successful');
      }
    } catch (error: unknown) {
      console.error('Auth - Logout error:', error);
    } finally {
      setTokens(null);
      localStorage.removeItem('tokens');
    }
  };

  // Rehydrate tokens from localStorage on mount
  useEffect(() => {
    const rehydrateTokens = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('tokens');
        if (stored) {
          const parsedTokens = JSON.parse(stored);
          try {
            const decoded = jwtDecode<{ exp: number }>(parsedTokens.accessToken);
            if (decoded.exp * 1000 < Date.now()) {
              console.log('Auth - Token expired on rehydration, clearing');
              logout();
            } else {
              setTokens(parsedTokens);
              console.log('Auth - Rehydrated tokens from localStorage:', parsedTokens);
            }
          } catch (error) {
            console.error('Auth - Error decoding token on rehydration:', error);
            logout();
          }
        }
        setIsLoading(false); // Rehydration complete
      }
    };

    rehydrateTokens();
  }, []);

  // Periodic token expiration check (optional, can be removed if not needed)
  useEffect(() => {
    if (!tokens?.accessToken || isLoading) return;

    const checkTokenExpiration = () => {
      try {
        const decoded = jwtDecode<{ exp: number }>(tokens.accessToken);
        if (decoded.exp * 1000 < Date.now()) {
          console.log('Auth - Token expired during session, logging out');
          logout();
        }
      } catch (error) {
        console.error('Auth - Error decoding token during session:', error);
        logout();
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, [tokens, isLoading]);

  return (
    <AuthContext.Provider value={{ tokens, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};