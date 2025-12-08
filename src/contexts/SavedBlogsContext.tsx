import React, { createContext, ReactNode, useContext, useState } from 'react';

interface SavedBlogsContextType {
  savedBlogs: number[];
  toggleSaveBlog: (blogId: number) => void;
}

const SavedBlogsContext = createContext<SavedBlogsContextType | undefined>(undefined);

interface SavedBlogsProviderProps {
  children: ReactNode;
}

export function SavedBlogsProvider({ children }: SavedBlogsProviderProps) {
  const [savedBlogs, setSavedBlogs] = useState<number[]>([]);

  const toggleSaveBlog = (blogId: number) => {
    setSavedBlogs(prev => 
      prev.includes(blogId) 
        ? prev.filter(id => id !== blogId)
        : [...prev, blogId]
    );
  };

  const value: SavedBlogsContextType = {
    savedBlogs,
    toggleSaveBlog,
  };

  return (
    <SavedBlogsContext.Provider value={value}>
      {children}
    </SavedBlogsContext.Provider>
  );
}

export function useSavedBlogs(): SavedBlogsContextType {
  const context = useContext(SavedBlogsContext);
  if (context === undefined) {
    throw new Error('useSavedBlogs must be used within a SavedBlogsProvider');
  }
  return context;
}
