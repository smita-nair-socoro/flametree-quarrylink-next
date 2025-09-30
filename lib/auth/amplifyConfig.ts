import { Amplify } from 'aws-amplify';
import { RuntimeConfig } from '@/app/stores/runtimeConfigStore';

let isConfigured = false;

// Helper function to get the base URL dynamically
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use window.location
    return `${window.location.protocol}//${window.location.host}`;
  }
  
  // Server-side: check environment variables or use defaults
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL 
    ? process.env.NEXT_PUBLIC_APP_URL
    : `${protocol}://localhost:3000`;
  
  return host;
}

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

  const baseUrl = getBaseUrl();
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
