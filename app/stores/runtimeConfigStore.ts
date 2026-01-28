// Define the type
export type RuntimeConfig = {
  COGNITO_DOMAIN: string;
  COGNITO_CLIENT_ID: string;
  COGNITO_REDIRECT_URI: string;
  AMPLIFY_AUTH_REGION: string;
  AMPLIFY_AUTH_USER_POOL_ID: string;
  AMPLIFY_AUTH_USER_POOL_WEB_CLIENT_ID: string;
  GOOGLE_MAPS_API_KEY: string;
  API_URL: string;
  SENTRY_DSN?: string | null;
  MICROSOFT_CLARITY_ID?: string | null;
};

// Internal variable
let RUNTIME: RuntimeConfig | null = null;

// Setter (called once when config is loaded)
export function setRuntimeConfig(cfg: RuntimeConfig) {
  RUNTIME = cfg;
}

// Getter (for non-React code)
export function getRuntimeConfig(): RuntimeConfig {
  if (!RUNTIME) {
    throw new Error('Runtime config not initialized yet');
  }
  return RUNTIME;
}
