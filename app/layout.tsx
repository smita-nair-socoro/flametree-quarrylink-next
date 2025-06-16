'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const webStorageStore =
  typeof window !== 'undefined'
    ? new WebStorageStateStore({ store: window.localStorage })
    : undefined;

const cognitoAuthConfig = {
  authority: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
  client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI,
  response_type: 'code',
  scope: 'email openid phone',

  stateStore: webStorageStore,
  userStore: webStorageStore,

  // Once sign-in completes, strip code & state from the URL
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },

  automaticSilentRenew: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider {...cognitoAuthConfig}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
