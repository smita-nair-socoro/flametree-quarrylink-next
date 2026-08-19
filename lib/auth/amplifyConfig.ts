import { RuntimeConfig } from '@/app/stores/runtimeConfigStore';

/**
 * No-op function for backward compatibility.
 * Amplify is no longer used — authentication is handled by NextAuth.js.
 */
export function configureAmplify(_config: RuntimeConfig) {
  // No-op — Amplify has been removed
}
