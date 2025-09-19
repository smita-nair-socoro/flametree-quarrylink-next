'use client';

import React, { ReactNode } from 'react';
import { AuthProvider as OidcProvider, AuthProviderProps } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';
import { SCOPE } from '../auth/authManager';
import {getRuntimeConfig, RuntimeConfig} from "@/app/stores/runtimeConfigStore";

const webStorageStore =
  typeof window !== 'undefined'
    ? new WebStorageStateStore({ store: window.localStorage })
    : undefined;

const oidcConfig = (cfg: RuntimeConfig): AuthProviderProps => ({
  authority: cfg.COGNITO_DOMAIN!,
  client_id: cfg.COGNITO_CLIENT_ID!,
  redirect_uri: getRedirectUri(cfg.COGNITO_REDIRECT_URI!),
  response_type: 'code',
  scope: SCOPE,
  stateStore: webStorageStore,
  userStore: webStorageStore,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
  automaticSilentRenew: true,
});

// standalone OIDC provider
export function OidcAuthProvider({ children }: { children: ReactNode }) {
  const cfg = getRuntimeConfig(); // ✅ safe: only runs after config is ready
  return <OidcProvider {...oidcConfig(cfg)}>{children}</OidcProvider>;
}

export function AppAuthProviders({ children }: { children: ReactNode }) {
  return <OidcAuthProvider>{children}</OidcAuthProvider>;
}

function getRedirectUri(cognitoRedirectUri: string) {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return `${origin}/callback/`; // always trailing slash
  }

  // Fallback to env (SSR/build time)
  return cognitoRedirectUri;
}
