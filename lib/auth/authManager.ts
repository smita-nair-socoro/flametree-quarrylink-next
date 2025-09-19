'use client';

import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
import {RuntimeConfig} from "@/app/stores/runtimeConfigStore";

export const SCOPE = 'email openid phone profile';

const webStorageStore =
  typeof window !== 'undefined'
    ? new WebStorageStateStore({ store: window.localStorage })
    : undefined;

export const userManager = (cfg: RuntimeConfig): UserManager  => new UserManager({
  authority: cfg.COGNITO_DOMAIN!,
  client_id: cfg.COGNITO_CLIENT_ID!,
  redirect_uri: getRedirectUri(cfg.COGNITO_REDIRECT_URI!),
  response_type: 'code',
  scope: SCOPE,

  stateStore: webStorageStore,
  userStore: webStorageStore,

  automaticSilentRenew: true,
});

function getRedirectUri(cognitoRedirectUri: string) {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return `${origin}/callback/`; // always trailing slash
  }

  // Fallback to env (SSR/build time)
  return cognitoRedirectUri;
}
