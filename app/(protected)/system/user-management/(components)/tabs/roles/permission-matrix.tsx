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
import { Check, X, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toneVariants } from './subscription-card';
import { Separator } from '@/components/ui/separator';

interface PermissionRole {
  name: string;
  isAdmin: boolean;
}

interface PermissionModule {
  name: string;
  permissions: {
    [roleKey: string]: boolean;
  };
}

interface PermissionMatrixProps {
  title: string;
  description: string;
  roles: PermissionRole[];
  modules: PermissionModule[];
  tone: keyof typeof toneVariants;
}

// Helper function to convert role name to permission key
function getRoleKey(roleName: string): string {
  return roleName.toLowerCase().replace(/\s+/g, '_');
}

export function PermissionMatrix({
  title,
  description,
  roles,
  modules,
  tone,
}: PermissionMatrixProps) {
  const toneStyle = toneVariants[tone];
  return (
    <Card className="w-full gap-0 md:gap-6 pb-0 md:pb-6">
      <CardHeader className="py-1 md:py-1 pb-0">
        <div className="space-y-0.75">
          <div className="flex items-baseline gap-2">
            <h3 className="md:text-[13px] md:font-normal text-[15px] font-semibold">
              Permission Matrix
            </h3>
            <span
              className={cn(
                'text-[11px] px-1.5 py-0.5 rounded-md font-medium border',
                toneStyle.bg,
                toneStyle.text,
                toneStyle.border,
              )}
            >
              {title}
            </span>
          </div>
          <p className="text-[13px] font-normal text-muted-foreground">
            <span className="hidden md:inline">{description}</span>
            <span className="md:hidden">
              Feature access by role for the selected plan
            </span>
          </p>
        </div>
      </CardHeader>

      {/* Mobile separator — sits between CardHeader and CardContent as a full-width flex sibling */}
      <Separator className="md:hidden" />

      <CardContent className="md:pt-6 pt-0">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table aria-label="Permission matrix showing feature access by role">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px] font-medium text-[13px]">
                  Module
                </TableHead>
                {roles.map((role) => (
                  <TableHead
                    key={role.name}
                    className="font-medium text-[13px] text-center"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {role.isAdmin && (
                        <Crown className="h-4 w-4 text-[#9810FA]" />
                      )}
                      {role.name}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => (
                <TableRow
                  key={module.name}
                  className="even:bg-[#F9FAFB] odd:bg-white"
                >
                  <TableCell className="text-[13px] font-medium">
                    {module.name}
                  </TableCell>
                  {roles.map((role) => {
                    const roleKey = getRoleKey(role.name);
                    const hasAccess = module.permissions[roleKey];
                    return (
                      <TableCell key={role.name} className="text-center">
                        {hasAccess ? (
                          <Check
                            className="h-4 w-4 text-green-600 mx-auto"
                            aria-label="Has access"
                          />
                        ) : (
                          <X
                            className="h-4 w-4 text-red-500 mx-auto"
                            aria-label="No access"
                          />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-border -mx-6">
          {modules.map((module) => {
            const hasAnyAccess = roles.some(
              (role) => module.permissions[getRoleKey(role.name)],
            );
            return (
              <div key={module.name} className="py-3 px-6">
                <p
                  className={cn(
                    'text-[14px] font-medium mb-2',
                    !hasAnyAccess && 'text-[#71717B]',
                  )}
                >
                  {module.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => {
                    const roleKey = getRoleKey(role.name);
                    const hasAccess = module.permissions[roleKey];
                    return (
                      <span
                        key={role.name}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium border',
                          hasAccess
                            ? 'bg-[#DCFCE7] border-[#BBF7D0] text-[#15803D]'
                            : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280]',
                        )}
                      >
                        {hasAccess ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        {role.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
