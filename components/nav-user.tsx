'use client';

import { BadgeCheck, ChevronsUpDown, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile, state, openMobile } = useSidebar();
  const { signOut } = useAuth();
  const router = useRouter();
  const isMobileDevice = useIsMobile();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Reset hover state when sidebar state changes
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [state, openMobile, isMobileDevice]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Determine if sidebar is truly collapsed
  const isCollapsed = isMobileDevice ? !openMobile : state === 'collapsed';

  // If collapsed, show hover card
  if (isCollapsed) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <HoverCard
            key={`nav-user-${forceUpdate}`}
            openDelay={150}
            closeDelay={150}
          >
            <HoverCardTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="hover:bg-[#7138f533] cursor-pointer"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
              </SidebarMenuButton>
            </HoverCardTrigger>
            <HoverCardContent
              side="right"
              align="end"
              className="w-64 p-1.5 bg-[#1e293b] border-[#334155] shadow-lg rounded-xl"
              sideOffset={8}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 px-1.5">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-white text-xs">
                      {user.name}
                    </span>
                    <span className="truncate text-[10px] text-[#94a3b8]">
                      {user.email}
                    </span>
                  </div>
                </div>
                <div className="h-px bg-[#334155]" />
                <div className="space-y-0.5">
                  <Link
                    href="/system/user-management"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-white hover:bg-[#7138F533] transition-all duration-200"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    <span>Account & Billings</span>
                  </Link>
                  <div className="h-px bg-[#334155] my-0.5" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-white hover:bg-[#7138F533] transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // If expanded, show dropdown menu
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <Tooltip delayDuration={300} mobileClickable={false}>
                  <TooltipTrigger asChild>
                    <span className="truncate font-medium text-white">
                      {user.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent variant="white">
                    <p>{user.name}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={300} mobileClickable={false}>
                  <TooltipTrigger asChild>
                    <span className="truncate text-xs text-white">
                      {user.email}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent variant="white">
                    <p>{user.email}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-white" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <Tooltip delayDuration={300} mobileClickable={false}>
                    <TooltipTrigger asChild>
                      <span className="truncate font-medium">{user.name}</span>
                    </TooltipTrigger>
                    <TooltipContent variant="white">
                      <p>{user.name}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip delayDuration={300} mobileClickable={false}>
                    <TooltipTrigger asChild>
                      <span className="truncate text-xs">{user.email}</span>
                    </TooltipTrigger>
                    <TooltipContent variant="white">
                      <p>{user.email}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/system/user-management"
                  className="flex items-center gap-2"
                >
                  <BadgeCheck />
                  Account & Billings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
