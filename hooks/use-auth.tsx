'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';

interface AuthContextType {
  user: {
    userId: string | null;
    username: string | null;
    signInDetails?: { loginId?: string };
  } | null;
  attributes: Record<string, string> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  const isLoadingSession = status === 'loading';

  // Build a user object that mimics the old Amplify AuthUser shape
  const user = session?.user
    ? {
        userId: session.user.id || null,
        username: session.user.email || null,
        signInDetails: { loginId: session.user.email || undefined },
      }
    : null;

  // Build attributes object that mimics the old Amplify fetchUserAttributes output
  const attributes: Record<string, string> | null = session?.user
    ? {
        email: session.user.email || '',
        name: session.user.fullName || session.user.name || '',
        'custom:tenant_id': session.user.tenantId || '',
        'custom:role': session.user.role || '',
      }
    : null;

  // Store tenant ID in localStorage for the APIClient's getTenantId()
  useEffect(() => {
    if (session?.user?.tenantId && typeof window !== 'undefined') {
      localStorage.setItem('tenantId', session.user.tenantId);
    }
  }, [session?.user?.tenantId]);

  useEffect(() => {
    if (!isLoadingSession) {
      setIsLoading(false);
    }
  }, [isLoadingSession]);

  const handleSignOut = async () => {
    try {
      await nextAuthSignOut({ redirect: false });
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        localStorage.removeItem('tenantId');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const refreshUser = async () => {
    // NextAuth automatically refreshes the session; nothing to do here
  };

  const value: AuthContextType = {
    user,
    attributes,
    isLoading,
    isAuthenticated: !!session?.user,
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
