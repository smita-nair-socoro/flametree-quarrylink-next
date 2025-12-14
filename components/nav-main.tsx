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

          // If item has no subitems, render as plain link
          if (!item.items || item.items.length === 0) {
            const itemIsDisabled = isDisabled(item.plan);
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
            return (
              <HoverCard
                key={`${item.url}-${forceUpdate}`}
                openDelay={200}
                closeDelay={100}
              >
                <HoverCardTrigger asChild>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isActive}
                      className="hover:bg-[#7138f533]"
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
                  className="w-64 p-2"
                  sideOffset={8}
                >
                  <div className="space-y-1">
                    <div className="font-medium text-sm mb-2">{item.title}</div>
                    {item.items.map((sub) => {
                      const subActive =
                        pathname === sub.url || pathname === `${sub.url}/`;
                      const subDisabled = isDisabled(sub.plan);
                      return (
                        <Link
                          key={sub.url}
                          href={sub.url}
                          aria-disabled={subDisabled}
                          className={`flex items-center justify-between gap-2 min-w-0 px-3 py-2 text-sm rounded-md hover:bg-[#7138F533] hover:text-black transition-colors
                            ${subActive ? 'text-white' : ''} ${
                            subDisabled ? 'pointer-events-none opacity-50' : ''
                          }`}
                        >
                          <span className="truncate whitespace-nowrap overflow-hidden">
                            {sub.title}
                          </span>
                          {subDisabled && (
                            <span className="shrink-0 text-[#6A7282] border border-[#6A7282] rounded-sm px-[5px]">
                              {getPlanLabel(sub.plan)}
                            </span>
                          )}
                        </Link>
                      );
                    })}
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
                  <SidebarMenuButton isActive={isActive}>
                    {item.icon && <item.icon className="text-white" />}
                    <span className="truncate whitespace-nowrap text-white">
                      {item.title}
                    </span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-white" />
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
