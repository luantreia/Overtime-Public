import React, { createContext, useContext, useState, useCallback } from 'react';
import { getAuthTokens, setAuthTokens } from '../../utils/apiClient';
import { getProfile } from '../../features/auth/services/authService';
import { Usuario } from '../../types';
import api from '../../shared/api/client';

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: Usuario, accessToken: string, refreshToken: string) => void;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: Usuario | null) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback((userData: Usuario, accessToken: string, refreshToken: string) => {
    setUserState(userData);
    setAuthTokens({ accessToken, refreshToken });
  }, []);

  const register = useCallback(async (nombre: string, email: string, password: string) => {
    const response = await api.register({ nombre, email, password });
    login(response.user, response.accessToken, response.refreshToken);
  }, [login]);

  const logout = useCallback(() => {
    setUserState(null);
    setAuthTokens({ accessToken: null, refreshToken: null });
  }, []);

  const setUser = useCallback((userData: Usuario | null) => {
    setUserState(userData);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getProfile();
      setUserState(profile);
    } catch (error) {
      console.error('Failed to refresh profile', error);
      logout();
    }
  }, [logout]);

  React.useEffect(() => {
    const initAuth = async () => {
      const { accessToken } = getAuthTokens();
      if (accessToken) {
        try {
          const profile = await getProfile();
          setUserState(profile);
        } catch (error) {
          console.error('Error restoring session:', error);
          setAuthTokens({ accessToken: null, refreshToken: null });
          setUserState(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    setUser,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
