'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Info,
  Mail,
  // Plus,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface NotificationGroup {
  name: string;
  icon: LucideIcon;
  description: string;
  emailTypes: string[];
  memberCount: number;
  manageable?: boolean;
}

interface EmailNotificationGroupsProps {
  description: string;
  groups: NotificationGroup[];
  footerNote?: string;
  onManage?: (groupName: string) => void;
  // onCreateGroup?: () => void;
}

export function EmailNotificationGroups({
  description,
  groups,
  footerNote,
  onManage,
  // onCreateGroup,
}: EmailNotificationGroupsProps) {
  return (
    <Card className="w-full gap-0 pb-0">
      <CardHeader className="py-4 pb-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-[#9810FA]" />
            <h3 className="text-[13px] font-semibold">
              Email Notification Groups
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent variant="white" className="max-w-[260px] text-[12px] leading-relaxed p-3">
                Notification groups are separate from permission roles. They determine which emails a user receives, not what they can access in the system. Groups are managed in AWS Cognito.
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-[13px] font-normal text-muted-foreground">
            {description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="md:pt-4 pt-0 pb-0">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table aria-label="Email notification groups">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[260px] font-medium text-[13px]">
                  Group
                </TableHead>
                <TableHead className="font-medium text-[13px]">
                  Email Types
                </TableHead>
                <TableHead className="w-[90px] font-medium text-[13px]">
                  Members
                </TableHead>
                <TableHead className="w-[100px] font-medium text-[13px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow
                  key={group.name}
                  className="bg-white hover:bg-gray-50"
                >
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F3FF] shrink-0">
                        <group.icon className="h-4 w-4" />
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-[13px] font-medium">{group.name}</p>
                        <p className="text-[13px] font-normal text-muted-foreground whitespace-normal">
                          {group.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {group.emailTypes.map((emailType) => (
                        <Badge
                          key={emailType}
                          variant="secondary"
                          className="text-[11px] font-medium text-[#374151]"
                        >
                          {emailType}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-[#18181B]">
                        {group.memberCount}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {group.manageable !== false && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-[12px] font-medium gap-1.5"
                        onClick={() => onManage?.(group.name)}
                      >
                        <UserCog className="h-3.5 w-3.5" />
                        Manage
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3 pt-4">
          {groups.map((group) => (
            <div
              key={group.name}
              className="rounded-xl border border-border p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F3FF] shrink-0">
                    <group.icon className="h-4 w-4" />
                  </span>
                  <p className="text-[14px] font-medium">{group.name}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[12px] font-medium text-[#374151] shrink-0">
                  <Users className="h-3 w-3" />
                  <span className="text-[#18181B]">{group.memberCount}</span>
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground">
                {group.description}
              </p>
              <div className="flex flex-col items-start gap-1.5">
                {group.emailTypes.map((emailType) => (
                  <Badge
                    key={emailType}
                    variant="secondary"
                    className="text-[12px] font-medium text-[#18181B] rounded-full gap-1.5"
                  >
                    <Mail className="h-3 w-3" />
                    {emailType}
                  </Badge>
                ))}
              </div>
              {group.manageable !== false && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-[13px] font-medium gap-1.5"
                  onClick={() => onManage?.(group.name)}
                >
                  <UserCog className="h-3.5 w-3.5" />
                  Manage
                </Button>
              )}
            </div>
          ))}
        </div>

        <Separator className="md:hidden mt-4" />

        {footerNote && (
          <p className="flex items-start gap-1.5 text-[12px] text-muted-foreground py-4">
            <Bell className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{footerNote}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
