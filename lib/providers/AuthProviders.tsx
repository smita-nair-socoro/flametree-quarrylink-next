'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { configureAmplify } from '../auth/amplifyConfig';
import { AuthProvider } from '@/hooks/use-auth';
import { useConfig } from './ConfigProvider';

export function AmplifyAuthProvider({ children }: { children: ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(false);
  const config = useConfig();

  useEffect(() => {
    try {
      configureAmplify(config);
      setIsConfigured(true);
    } catch (error) {
      console.error('Failed to configure Amplify:', error);
    }
  }, [config]);

  if (!isConfigured) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return <AuthProvider>{children}</AuthProvider>;
}

export function AppAuthProviders({ children }: { children: ReactNode }) {
  return <AmplifyAuthProvider>{children}</AmplifyAuthProvider>;
}
