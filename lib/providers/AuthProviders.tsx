'use client';

import React, { ReactNode } from 'react';
import { AuthProvider as OidcProvider } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';
import { SCOPE } from '../auth/authManager';

const redirectUri =
  typeof window !== 'undefined'
    ? `${window.location.origin}/callback`
    : undefined;

const webStorageStore =
  typeof window !== 'undefined'
    ? new WebStorageStateStore({ store: window.localStorage })
    : undefined;

const oidcConfig = {
  authority: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
  client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
  redirect_uri: redirectUri || process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!,
  response_type: 'code',
  scope: SCOPE,
  stateStore: webStorageStore,
  userStore: webStorageStore,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
  automaticSilentRenew: true,
};

// standalone OIDC provider
export function OidcAuthProvider({ children }: { children: ReactNode }) {
  return <OidcProvider {...oidcConfig}>{children}</OidcProvider>;
}

export function AppAuthProviders({ children }: { children: ReactNode }) {
  return <OidcAuthProvider>{children}</OidcAuthProvider>;
}
