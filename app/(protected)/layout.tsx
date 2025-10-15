'use client';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.replace(`/login?returnTo=${encodeURIComponent(currentPath)}`);
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  if (auth.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-w-0">
        <header className="flex h-10 shrink-0 items-center gap-2 px-4 bg-[#F9FAFB]">
          {/* Mobile trigger - only visible when sidebar is closed */}
          <SidebarTrigger className="md:hidden" />
        </header>
        <div className="flex-1 overflow-hidden bg-[#F9FAFB]">
          <div className="h-full overflow-y-auto overflow-x-hidden p-4">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
