import React, { createContext, ReactNode, useContext, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userToken: string | null;
  signIn: (token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [userToken, setUserToken] = useState<string | null>(null);

  const signIn = (token: string) => {
    setUserToken(token);
  };

  const signOut = () => {
    setUserToken(null);
  };

  const value: AuthContextType = {
    isAuthenticated: !!userToken,
    userToken,
    signIn,
    signOut,
  };

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
