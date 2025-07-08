'use client';

import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const redirectUri =  typeof window !== 'undefined' ? `${window.location.origin}/callback` : undefined;

const webStorageStore =
  typeof window !== 'undefined'
    ? new WebStorageStateStore({ store: window.localStorage })
    : undefined;

export const userManager = new UserManager({
  authority: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
  client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
  redirect_uri: redirectUri || process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!,
  response_type: 'code',
  scope: 'email openid phone',

  stateStore: webStorageStore,
  userStore: webStorageStore,

  automaticSilentRenew: true,
});
