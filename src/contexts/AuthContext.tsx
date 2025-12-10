import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import storage from '../utils/storage';
import type { UserProfile } from '../utils/types';

interface AuthContextType {
  isAuthenticated: boolean;
  userToken: string | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signIn: (token: string, profile?: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from storage on app start
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await storage.getToken();
        console.log('🔐 AuthContext - Loading token:', storedToken ? 'Found' : 'Not found');
        if (storedToken) {
          setUserToken(storedToken);
        }
      } catch (error) {
        console.error('Error loading token:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const signIn = async (token: string, profile?: UserProfile) => {
    setUserToken(token);
    await storage.setToken(token);
    if (profile) {
      setUserProfile(profile);
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 AuthContext - Signing out user');
      // Clear user state
      setUserToken(null);
      setUserProfile(null);
      // Remove token from AsyncStorage
      await storage.clearToken();
      console.log('✅ AuthContext - User signed out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? { ...prev, ...profile } : null);
  };

  const value: AuthContextType = {
    isAuthenticated: !!userToken,
    userToken,
    userProfile,
    isLoading,
    signIn,
    signOut,
    updateUserProfile,
  };

  // Debug authentication state changes
  useEffect(() => {
    console.log('🔄 AuthContext - State changed:', {
      isAuthenticated: !!userToken,
      hasToken: !!userToken,
      isLoading,
    });
  }, [userToken, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
