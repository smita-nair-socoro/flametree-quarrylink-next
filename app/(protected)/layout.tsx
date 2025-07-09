'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useOidc } from 'react-oidc-context';
import { useCookieAuth } from '@/lib/auth/cookieAuthContext';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ModeToggle } from '@/components/toggle';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const oidc = useOidc();
  const cookie = useCookieAuth();
  const router = useRouter();

  const isLoading = oidc.isLoading || cookie.loading;

  const isAuthenticated = oidc.isAuthenticated || Boolean(cookie.user);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          {/* TODO: BreadCrumb in the future? */}
          {/* <Breadcrumb> */}
          {/*   <BreadcrumbList> */}
          {/*     <BreadcrumbItem className="hidden md:block"> */}
          {/*       <BreadcrumbLink href="#"> */}
          {/*         Building Your Application */}
          {/*       </BreadcrumbLink> */}
          {/*     </BreadcrumbItem> */}
          {/*     <BreadcrumbSeparator className="hidden md:block" /> */}
          {/*     <BreadcrumbItem> */}
          {/*       <BreadcrumbPage>Data Fetching</BreadcrumbPage> */}
          {/*     </BreadcrumbItem> */}
          {/*   </BreadcrumbList> */}
          {/* </Breadcrumb> */}

          <div className="absolute top-4 right-4 z-50">
            <ModeToggle />
          </div>
        </header>
        <div className="mt-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
