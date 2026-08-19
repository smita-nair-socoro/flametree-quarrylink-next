'use client';

import { signOut as nextAuthSignOut } from 'next-auth/react';

export const SCOPE = 'email openid phone profile';

export async function handleLogout() {
  try {
    await nextAuthSignOut({ redirect: false });
    // Redirect to login page after successful logout
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.removeItem('tenantId');
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
