'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { setLocalStorage } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    isDisabled?: boolean;
    items?: {
      title: string;
      url: string;
      isDisabled?: boolean;
      badge?: number;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const { state, open, openMobile, isMobile } = useSidebar();
  const isMobileDevice = useIsMobile();
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({
    '/customer-operations': true,
    '/logistics': true,
    '/inventory': true,
  });
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    if (pathname) {
      setLocalStorage('last-route', pathname);
    }
  }, [pathname]);

  // Reset hover state when sidebar state changes and force re-render
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [state, open, openMobile, isMobile, isMobileDevice]);

  // Determine if sidebar is truly collapsed
  const isCollapsed = isMobileDevice ? !openMobile : state === 'collapsed';

  return (
    <SidebarGroup key={forceUpdate}>
      <SidebarGroupLabel className="text-[#ffffffb2]">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            pathname === item.url ||
            pathname === `${item.url}/` ||
            item.items?.some(
              (sub) => pathname === sub.url || pathname === `${sub.url}/`,
            );
          const isOpen = openStates[item.url] ?? false;

          // If item has no subitems
          if (!item.items || item.items.length === 0) {
            // If collapsed, show hover card
            if (isCollapsed) {
              return (
                <HoverCard
                  key={`${item.url}-${forceUpdate}`}
                  openDelay={150}
                  closeDelay={150}
                >
                  <HoverCardTrigger asChild>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`hover:bg-[#7138f533] ${item.isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        <Link href={item.url}>
                          {item.icon && <item.icon className="text-white" />}
                          <span className="truncate whitespace-nowrap">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="right"
                    align="start"
                    className="w-64 p-1.5 bg-[#1e293b] border-[#334155] shadow-lg rounded-xl"
                    sideOffset={8}
                  >
                    <Link
                      href={item.url}
                      className={`flex items-center justify-between gap-2 min-w-0 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200
                        ${isActive
                          ? 'bg-[#7138F5] text-white'
                          : 'text-white hover:bg-[#7138F533]'
                        }`}
                    >
                      <span className="truncate whitespace-nowrap overflow-hidden">
                        {item.title}
                      </span>
                    </Link>
                  </HoverCardContent>
                </HoverCard>
              );
            }

            // If expanded, render as plain link
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={item.isDisabled ? 'opacity-50 pointer-events-none' : ''}
                >
                  <Link
                    href={item.url}
                    className="flex items-center justify-between gap-2 min-w-0"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {item.icon && <item.icon className="text-white" />}
                      <Tooltip delayDuration={300} mobileClickable={false}>
                        <TooltipTrigger asChild>
                          <span className="truncate whitespace-nowrap text-white">
                            {item.title}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent variant="white">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // If collapsed and has subitems, show hover card
          if (isCollapsed && item.items && item.items.length > 0) {
            return (
              <HoverCard
                key={`${item.url}-${forceUpdate}`}
                openDelay={150}
                closeDelay={150}
              >
                <HoverCardTrigger asChild>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isActive}
                      className={`hover:bg-[#7138f533] ${item.isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {item.icon && <item.icon className="text-white" />}
                      <Tooltip delayDuration={300} mobileClickable={false}>
                        <TooltipTrigger asChild>
                          <span className="truncate whitespace-nowrap">
                            {item.title}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent variant="white">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </HoverCardTrigger>
                <HoverCardContent
                  side="right"
                  align="start"
                  className="w-56 p-2 bg-[#1e293b] border-[#334155] shadow-lg rounded-xl"
                  sideOffset={12}
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-sm mb-2 text-white px-2">
                      {item.title}
                    </div>
                    <div className="relative pl-3 border-l-2 border-[#475569] ml-2">
                      {item.items.map((sub) => {
                        const subActive =
                          pathname === sub.url || pathname === `${sub.url}/`;
                        return (
                          <Link
                            key={sub.url}
                            href={sub.url}
                            className={`flex items-center justify-between gap-2 min-w-0 px-2 py-2 text-sm rounded-lg transition-all duration-200 mb-1
                                ${subActive
                                ? 'bg-[#7138F5] text-white font-medium'
                                : 'text-white hover:bg-[#7138F533]'
                              } ${sub.isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            <Tooltip delayDuration={300} mobileClickable={false}>
                              <TooltipTrigger asChild>
                                <span className="truncate whitespace-nowrap overflow-hidden">
                                  {sub.title}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent variant="white">
                                <p>{sub.title}</p>
                              </TooltipContent>
                            </Tooltip>
                            {sub.badge != null && sub.badge > 0 ? (
                              <span className="ml-auto shrink-0 rounded-md bg-destructive px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
                                {sub.badge}
                              </span>
                            ) : null}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
          }

          // If expanded and has subitems, show collapsible menu
          return (
            <Collapsible
              key={item.url}
              asChild
              open={isOpen}
              onOpenChange={(open) =>
                setOpenStates({
                  ...openStates,
                  [item.url]: open,
                })
              }
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    isActive={isActive}
                    className={item.isDisabled ? 'opacity-50 pointer-events-none' : ''}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {item.icon && <item.icon className="text-white" />}
                      <Tooltip delayDuration={300} mobileClickable={false}>
                        <TooltipTrigger asChild>
                          <span className="truncate whitespace-nowrap text-white">
                            {item.title}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent variant="white">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-white" />
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((sub) => {
                      const subActive =
                        pathname === sub.url || pathname === `${sub.url}/`;
                      return (
                        <SidebarMenuSubItem key={sub.url}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={subActive}
                            className={`hover:bg-[#7138F533] data-[active=true]:!bg-[#7138F5] ${sub.isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            <Link
                              href={sub.url}
                              className="flex items-center w-full justify-between gap-2 min-w-0"
                            >
                              <Tooltip delayDuration={300} mobileClickable={false}>
                                <TooltipTrigger asChild>
                                  <span className="text-white truncate whitespace-nowrap overflow-hidden">
                                    {sub.title}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent variant="white">
                                  <p>{sub.title}</p>
                                </TooltipContent>
                              </Tooltip>
                              {sub.badge != null && sub.badge > 0 ? (
                                <span className="ml-auto shrink-0 rounded-md bg-destructive px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
                                  {sub.badge}
                                </span>
                              ) : null}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
