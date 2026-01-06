import { Amplify } from 'aws-amplify';
import { RuntimeConfig } from '@/app/stores/runtimeConfigStore';

export function configureAmplify(config: RuntimeConfig) {
  if (
    !config.AMPLIFY_AUTH_REGION ||
    !config.AMPLIFY_AUTH_USER_POOL_ID ||
    !config.AMPLIFY_AUTH_USER_POOL_WEB_CLIENT_ID
  ) {
    throw new Error('AMPLIFY_AUTH configuration is missing required fields');
  }

  // Build redirect URLs dynamically from window.location (client-side only)
  const baseUrl =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}`
      : 'http://localhost:3000';
  const redirectSignIn = `${baseUrl}/callback`;

  // User signs out -> Amplify handles logout (clears tokens, sessions, etc.) -> User lands on home page.
  const redirectSignOut = `${baseUrl}`;

  const amplifyConfig = {
    Auth: {
      Cognito: {
        userPoolId: config.AMPLIFY_AUTH_USER_POOL_ID,
        userPoolClientId: config.AMPLIFY_AUTH_USER_POOL_WEB_CLIENT_ID,
        loginWith: {
          email: true,
          oauth: {
            domain: config.COGNITO_HOSTED_UI_DOMAIN,
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
}
