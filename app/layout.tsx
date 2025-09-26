import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { TanstackQueryProvider } from '@/lib/providers/tanstack-query-provider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Toaster } from '@/components/ui/sonner';
import { AppAuthProviders } from '@/lib/providers/AuthProviders';
import {ConfigProvider} from "@/lib/providers/ConfigProvider";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
      <ConfigProvider>
        <AppAuthProviders>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative min-h-screen">
              {/* TanstackQuery */}
              <TanstackQueryProvider>
                <ReactQueryDevtools initialIsOpen={false} />
                <main>{children}</main>
                <Toaster
                  position="top-right"
                  richColors
                  toastOptions={{
                    // global defaults
                    duration: 4000,
                    closeButton: true,
                  }}
                />
              </TanstackQueryProvider>
            </div>
          </ThemeProvider>
        </AppAuthProviders>
      </ConfigProvider>
      </body>
    </html>
  );
}
