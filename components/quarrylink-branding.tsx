"use client"

import * as React from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function QuarryLinkBranding({
  subscriptionType = "Lite Plus"
}: {
  subscriptionType?: string
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-default hover:bg-transparent"
        >
          <div className="bg-purple-100 text-purple-900 flex aspect-square size-8 items-center justify-center rounded-lg border-2 border-purple-200">
            <span className="text-lg font-bold">Q</span>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">QuarryLink</span>
            <span className="truncate text-xs text-muted-foreground">{subscriptionType}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
