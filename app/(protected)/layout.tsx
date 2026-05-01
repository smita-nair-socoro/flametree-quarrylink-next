'use client';
import * as React from 'react';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

import { UserDetailQueryOptions } from '@/lib/api/user';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/app/stores/user-store';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const userId = auth.user?.userId || '';
  const { data: currentUser, isPending: isUserDetailPending } = useQuery(
    UserDetailQueryOptions(userId),
  );

  React.useEffect(() => {
    if (currentUser) {
      useUserStore.getState().setUserName(currentUser.name ?? '');
      useUserStore.getState().setUserGroups(currentUser.groups ?? []);
    }
  }, [currentUser]);

  const path = pathname ?? '';
  const isDriversApp = path.startsWith('/drivers-app');
  const isDeliveries = path.startsWith('/logistics/deliveries');

  const isDriver =
    !!currentUser && (currentUser.groups?.includes('driver') || false);
  const driverRouteMismatch =
    !!currentUser && isDriver && !path.startsWith('/drivers-app');
  const nonDriverRouteMismatch =
    !!currentUser && !isDriver && path.startsWith('/drivers-app');

  React.useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.replace(`/login?returnTo=${encodeURIComponent(currentPath)}`);
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  // Run before paint so drivers never flash staff-only pages (e.g. after login default URL).
  React.useLayoutEffect(() => {
    if (auth.isLoading || !auth.isAuthenticated || !currentUser) return;

    if (isDriver && !path.startsWith('/drivers-app')) {
      router.replace('/drivers-app');
      return;
    }
    if (!isDriver && path.startsWith('/drivers-app')) {
      router.replace('/customer-operations/customers');
    }
  }, [auth.isLoading, auth.isAuthenticated, currentUser, isDriver, path, router]);

  if (auth.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return null;
  }

  if (userId && isUserDetailPending && !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (driverRouteMismatch || nonDriverRouteMismatch) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      {!isDriversApp && !isDeliveries && <AppSidebar />}
      <SidebarInset className="flex flex-col min-w-0">
        {!isDriversApp && !isDeliveries && (
          <header className="flex h-10 shrink-0 items-center gap-2 px-4 bg-[#F9FAFB]">
            {/* Mobile trigger - only visible when sidebar is closed */}
            <SidebarTrigger className="md:hidden" />
          </header>
        )}
        <div className="flex-1 overflow-auto bg-[#F9FAFB]">
          <div className="h-full overflow-auto">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
