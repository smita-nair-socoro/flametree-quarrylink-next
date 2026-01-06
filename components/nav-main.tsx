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
import { useLocalStorageState } from '@/hooks/use-localstorage';
import { useEffect, useState } from 'react';
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
    plan?: string;
    items?: {
      title: string;
      url: string;
      plan?: string;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const { state, open, openMobile, isMobile } = useSidebar();
  const isMobileDevice = useIsMobile();
  const [openStates, setOpenStates] = useLocalStorageState<
    Record<string, boolean>
  >('nav-open-states', {});
  const [forceUpdate, setForceUpdate] = useState(0);
  const isDisabled = (plan?: string) => plan === 'PRO' || plan === 'PLUS';
  const getPlanLabel = (plan?: string) => (plan ? plan.toUpperCase() : '');

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
              (sub) => pathname === sub.url || pathname === `${sub.url}/`
            );
          const isOpen = openStates[item.url] ?? false;

          // If item has no subitems
          if (!item.items || item.items.length === 0) {
            const itemIsDisabled = isDisabled(item.plan);

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
                        aria-disabled={itemIsDisabled}
                        className="hover:bg-[#7138f533]"
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
                      aria-disabled={itemIsDisabled}
                      className={`flex items-center justify-between gap-2 min-w-0 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? 'bg-[#7138F5] text-white'
                            : 'text-white hover:bg-[#7138F533]'
                        } ${
                        itemIsDisabled
                          ? 'pointer-events-none opacity-40 text-[#94a3b8]'
                          : ''
                      }`}
                    >
                      <span className="truncate whitespace-nowrap overflow-hidden">
                        {item.title}
                      </span>
                      {itemIsDisabled && (
                        <span className="shrink-0 text-[#94a3b8] border border-[#475569] rounded-sm px-1.5 py-0.5 text-xs font-medium">
                          {getPlanLabel(item.plan)}
                        </span>
                      )}
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
                  aria-disabled={itemIsDisabled}
                >
                  <Link
                    href={item.url}
                    className="flex items-center justify-between gap-2 min-w-0"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {item.icon && <item.icon className="text-white" />}
                      <span className="truncate whitespace-nowrap text-white">
                        {item.title}
                      </span>
                    </span>
                    {itemIsDisabled && (
                      <span className="shrink-0 text-[#6A7282] border border-[#6A7282] rounded-sm px-[5px]">
                        {getPlanLabel(item.plan)}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // If collapsed and has subitems, show hover card
          if (isCollapsed && item.items && item.items.length > 0) {
            const itemIsDisabled = isDisabled(item.plan);
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
                      className={`hover:bg-[#7138f533] ${
                        itemIsDisabled ? 'opacity-40' : ''
                      }`}
                    >
                      {item.icon && <item.icon className="text-white" />}
                      <span className="truncate whitespace-nowrap">
                        {item.title}
                      </span>
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
                        const subDisabled = isDisabled(sub.plan);
                        return (
                          <Link
                            key={sub.url}
                            href={sub.url}
                            aria-disabled={subDisabled}
                            className={`flex items-center justify-between gap-2 min-w-0 px-2 py-2 text-sm rounded-lg transition-all duration-200 mb-1
                              ${
                                subActive
                                  ? 'bg-[#7138F5] text-white font-medium'
                                  : 'text-white hover:bg-[#7138F533]'
                              } ${
                              subDisabled
                                ? 'pointer-events-none opacity-40 text-[#94a3b8]'
                                : ''
                            }`}
                          >
                            <span className="truncate whitespace-nowrap overflow-hidden">
                              {sub.title}
                            </span>
                            {subDisabled && (
                              <span className="shrink-0 text-[#94a3b8] border border-[#475569] rounded-sm px-1.5 py-0.5 text-xs font-medium">
                                {getPlanLabel(sub.plan)}
                              </span>
                            )}
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
          const itemIsDisabled = isDisabled(item.plan);
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
                    className={itemIsDisabled ? 'opacity-40' : ''}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {item.icon && <item.icon className="text-white" />}
                      <span className="truncate whitespace-nowrap text-white">
                        {item.title}
                      </span>
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      {itemIsDisabled && (
                        <span className="shrink-0 text-[#6A7282] border border-[#6A7282] rounded-sm px-[5px]">
                          {getPlanLabel(item.plan)}
                        </span>
                      )}
                      <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-white" />
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((sub) => {
                      const subActive =
                        pathname === sub.url || pathname === `${sub.url}/`;
                      const subDisabled = isDisabled(sub.plan);
                      return (
                        <SidebarMenuSubItem key={sub.url}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={subActive}
                            aria-disabled={subDisabled}
                            className="hover:bg-[#7138F533] data-[active=true]:!bg-[#7138F5]"
                          >
                            <Link
                              href={sub.url}
                              className="flex items-center w-full justify-between gap-2 min-w-0"
                            >
                              <span className="text-white truncate whitespace-nowrap overflow-hidden">
                                {sub.title}
                              </span>
                              {subDisabled && (
                                <span className="shrink-0 text-[#6A7282] border border-[#6A7282] rounded-sm px-[5px]">
                                  {getPlanLabel(sub.plan)}
                                </span>
                              )}
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
