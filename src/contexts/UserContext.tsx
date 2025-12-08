import React, { createContext, ReactNode, useContext, useState } from 'react';

interface UserProfile {
  name: string;
  email: string;
  profileImage?: string;
}

interface UserContextType {
  userProfile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImage: undefined,
  });

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profile }));
  };

  const value: UserContextType = {
    userProfile,
    updateProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
