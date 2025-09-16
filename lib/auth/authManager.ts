'use client';

import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

export const SCOPE = 'email openid phone profile';

const webStorageStore =
  typeof window !== 'undefined'
    ? new WebStorageStateStore({ store: window.localStorage })
    : undefined;

export const userManager = new UserManager({
  authority: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
  client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
  redirect_uri: getRedirectUri(),
  response_type: 'code',
  scope: SCOPE,

  stateStore: webStorageStore,
  userStore: webStorageStore,

  automaticSilentRenew: true,
});

function getRedirectUri() {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;

    if (origin.includes('app.dev.quarrylink.com.au')) {
      return `${origin}/callback/`; // dev with trailing slash
    }

    return `${origin}/callback`; // local or other environments
  }

  // Fallback to env (useful for SSR/build time)
  return process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!;
}
