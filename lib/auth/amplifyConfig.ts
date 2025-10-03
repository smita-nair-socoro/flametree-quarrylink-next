import { Amplify } from 'aws-amplify';
import { RuntimeConfig } from '@/app/stores/runtimeConfigStore';

let isConfigured = false;

export function configureAmplify(config: RuntimeConfig) {
  if (isConfigured) {
    return;
  }

  if (
    !config.AMPLIFY_AUTH_REGION ||
    !config.AMPLIFY_AUTH_USER_POOL_ID ||
    !config.AMPLIFY_AUTH_USER_POOL_WEB_CLIENT_ID
  ) {
    throw new Error('AMPLIFY_AUTH configuration is missing required fields');
  }

  // Build redirect URLs dynamically from window.location (client-side only)
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}`
    : 'http://localhost:3000';
  const redirectSignIn = `${baseUrl}/callback`;
  const redirectSignOut = `${baseUrl}/`;

  const amplifyConfig = {
    Auth: {
      Cognito: {
        userPoolId: config.AMPLIFY_AUTH_USER_POOL_ID,
        userPoolClientId: config.AMPLIFY_AUTH_USER_POOL_WEB_CLIENT_ID,
        loginWith: {
          email: true,
          oauth: {
            domain: config.AMPLIFY_AUTH_USER_POOL_ID.replace('ap-southeast-2_', '') + '.auth.ap-southeast-2.amazoncognito.com',
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [redirectSignIn],
            redirectSignOut: [redirectSignOut],
            responseType: 'code' as const,
            providers: ['Google'],
          },
        },
        signUpVerificationMethod: 'code' as const,
        userAttributes: {
          email: {
            required: true,
          },
        },
        passwordFormat: {
          minLength: 8,
          requireLowercase: false,
          requireUppercase: false,
          requireNumbers: false,
          requireSpecialCharacters: false,
        },
      },
    },
  };

  Amplify.configure(amplifyConfig as Parameters<typeof Amplify.configure>[0]);
  isConfigured = true;
}
