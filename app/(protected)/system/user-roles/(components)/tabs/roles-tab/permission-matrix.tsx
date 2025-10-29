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

export interface PermissionRole {
  name: string;
  isAdmin: boolean;
}

export interface PermissionModule {
  name: string;
  permissions: {
    [roleKey: string]: boolean;
  };
}

export interface PermissionMatrixProps {
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
    <Card className="w-full">
      <CardHeader className="py-1">
        <div className="space-y-0.75">
          <div className="flex items-baseline gap-2">
            <h3 className="text-[13px] font-normal">Permission Matrix</h3>
            <span
              className={cn(
                'text-[11px] px-1.5 py-0.5 rounded-md font-medium border',
                toneStyle.bg,
                toneStyle.text,
                toneStyle.border
              )}
            >
              {title}
            </span>
          </div>
          <p className="text-[13px] font-normal text-muted-foreground">
            {description}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Table */}
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

        {/* Legend */}
        <div className="mt-3 px-2 py-3 bg-[#F9FAFB] rounded-md space-y-2">
          <div className="font-medium text-foreground text-[13px]">
            Legend:
          </div>
          <div className="flex items-center text-xs font-normal justify-between">
            <div className="flex items-center gap-2 w-1/3">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">Full Access</span>
            </div>
            <div className="flex items-center gap-2 w-1/3">
              <X className="h-4 w-4 text-red-500" />
              <span className="text-muted-foreground">No Access</span>
            </div>
            <div className="flex items-center gap-2 w-1/3">
              <Crown className="h-4 w-4 text-[#9810FA]" />
              <span className="text-muted-foreground">Admin Only</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
