import { Amplify } from 'aws-amplify';
import { RuntimeConfig } from '@/app/stores/runtimeConfigStore';

let isConfigured = false;

export function configureAmplify(config: RuntimeConfig) {
  // Prevent multiple configurations
  if (isConfigured) {
    console.log('Amplify already configured, skipping...');
    return;
  }

  if (!config.AMPLIFY_AUTH) {
    throw new Error('AMPLIFY_AUTH configuration is missing');
  }

  // Use the legacy configuration format for compatibility
  const amplifyConfig = {
    aws_project_region: config.AMPLIFY_AUTH.region,
    aws_cognito_region: config.AMPLIFY_AUTH.region,
    aws_user_pools_id: config.AMPLIFY_AUTH.userPoolId,
    aws_user_pools_web_client_id: config.AMPLIFY_AUTH.userPoolWebClientId,
    aws_cognito_username_attributes: ['email'],
    aws_cognito_social_providers: [],
    aws_cognito_signup_attributes: ['email'],
    aws_cognito_mfa_configuration: 'OFF',
    aws_cognito_mfa_types: ['SMS'],
    aws_cognito_password_protection_settings: {
      passwordPolicyMinLength: 8,
      passwordPolicyCharacters: [],
    },
    aws_cognito_verification_mechanisms: ['email'],
  };

  Amplify.configure(amplifyConfig);
  isConfigured = true;
  console.log('Amplify configured successfully');
}
