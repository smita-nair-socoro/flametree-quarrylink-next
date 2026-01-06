'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  getCurrentUser,
  signOut,
  AuthUser,
  fetchUserAttributes,
  FetchUserAttributesOutput,
} from 'aws-amplify/auth';

interface AuthContextType {
  user: AuthUser | null;
  attributes: FetchUserAttributesOutput | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [attributes, setAttributes] = useState<FetchUserAttributesOutput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      try {
        const fetchedAttributes = await fetchUserAttributes();
        setAttributes(fetchedAttributes);
      } catch (attrError) {
        console.warn('Unable to fetch user attributes:', attrError);
        setAttributes(null);
      }
    } catch (error) {
      setUser(null);
      setAttributes(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setAttributes(null);

      // Clear all sessionStorage to reset table states and other session data
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    attributes,
    isLoading,
    isAuthenticated: !!user,
    signOut: handleSignOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
