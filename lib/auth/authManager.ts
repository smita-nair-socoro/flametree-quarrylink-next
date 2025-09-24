'use client';

import { signOut } from 'aws-amplify/auth';

export const SCOPE = 'email openid phone profile';

export async function handleLogout() {
  try {
    await signOut();
    // Redirect to login page after successful logout
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Force redirect even if logout fails
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}
