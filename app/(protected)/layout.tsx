'use client';
import { ReactNode, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';
import { navItems } from '@/components/app-sidebar';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isDriversApp = pathname?.startsWith('/drivers-app');

  // Build quick lookup for plan by path and first essential fallback
  const { getPlanByPath, fallbackUrl } = useMemo(() => {
    const pathToPlan = new Map<string, string>();
    const customersPath = '/customer-operations/customers';

    for (const item of navItems) {
      if ('plan' in item && item.plan) {
        pathToPlan.set(item.url, item.plan);
      }
      if (item.items) {
        for (const sub of item.items) {
          if (sub.plan) {
            pathToPlan.set(sub.url, sub.plan);
          }
        }
      }
    }

    return {
      getPlanByPath: (path: string) => {
        if (pathToPlan.has(path)) return pathToPlan.get(path);
        let matchedBasePath: string | undefined;
        for (const key of pathToPlan.keys()) {
          if (path === key || path.startsWith(`${key}/`)) {
            if (!matchedBasePath || key.length > matchedBasePath.length) {
              matchedBasePath = key;
            }
          }
        }
        return matchedBasePath ? pathToPlan.get(matchedBasePath) : undefined;
      },
      fallbackUrl: customersPath,
    };
  }, []);

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.replace(`/login?returnTo=${encodeURIComponent(currentPath)}`);
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  // Block access to non-Essential pages (PRO/PLUS)
  useEffect(() => {
    if (auth.isLoading || !auth.isAuthenticated) return;
    const path = window.location.pathname.toUpperCase();
    const plan = getPlanByPath(path);
    if (plan === 'PRO' || plan === 'PLUS') {
      router.replace(fallbackUrl);
    }
  }, [
    auth.isLoading,
    auth.isAuthenticated,
    getPlanByPath,
    fallbackUrl,
    router,
  ]);

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

  return (
    <SidebarProvider>
      {!isDriversApp && <AppSidebar />}
      <SidebarInset className="flex flex-col min-w-0">
        {!isDriversApp && (
          <header className="flex h-10 shrink-0 items-center gap-2 px-4 bg-[#F9FAFB]">
            {/* Mobile trigger - only visible when sidebar is closed */}
            <SidebarTrigger className="md:hidden" />
          </header>
        )}
        <div className="flex-1 overflow-auto bg-[#F9FAFB]">
          <div className="h-full overflow-auto">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
