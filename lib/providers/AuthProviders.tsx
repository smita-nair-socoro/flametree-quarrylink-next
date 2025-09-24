'use client';

import React, { ReactNode, useEffect } from 'react';
import { configureAmplify } from '../auth/amplifyConfig';
import { getRuntimeConfig } from "@/app/stores/runtimeConfigStore";
import { AuthProvider } from '@/hooks/use-auth';

// Amplify Auth Provider
export function AmplifyAuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const config = getRuntimeConfig();
    configureAmplify(config);
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}

export function AppAuthProviders({ children }: { children: ReactNode }) {
  return <AmplifyAuthProvider>{children}</AmplifyAuthProvider>;
}
