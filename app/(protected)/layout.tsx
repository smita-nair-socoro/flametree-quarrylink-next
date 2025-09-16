'use client';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useOidc } from 'react-oidc-context';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ModeToggle } from '@/components/toggle';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const oidc = useOidc();
  const router = useRouter();
  const isLoading = oidc.isLoading;
  const isAuthenticated = oidc.isAuthenticated;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          {/* Mobile trigger - only visible when sidebar is closed */}
          <SidebarTrigger className="md:hidden" />
          <div className="absolute top-4 right-4 z-50">
            <ModeToggle />
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden p-4">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
