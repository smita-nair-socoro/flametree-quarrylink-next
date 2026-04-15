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
import { Separator } from '@/components/ui/separator';

interface PermissionRole {
  name: string;
  isAdmin?: boolean;
}

interface PermissionModule {
  name: string;
  permissions: {
    [roleKey: string]: boolean;
  };
}

interface PermissionSection {
  sectionName: string;
  modules: PermissionModule[];
}

interface PermissionMatrixProps {
  description: string;
  roles: PermissionRole[];
  sections: PermissionSection[];
  footerNote?: string;
}

function getRoleKey(roleName: string): string {
  return roleName.toLowerCase().replace(/\s+/g, '_');
}

export function PermissionMatrix({
  description,
  roles,
  sections,
  footerNote,
}: PermissionMatrixProps) {
  return (
    <Card className="w-full gap-0 pb-0">
      <CardHeader className="py-4 pb-2">
        <div className="space-y-0.5">
          <h3 className="text-[13px] font-semibold">Permission matrix</h3>
          <p className="text-[13px] font-normal text-muted-foreground">
            <span className="hidden md:inline">{description}</span>
            <span className="md:hidden">
              Example access by role for each module on this subscription
            </span>
          </p>
        </div>
      </CardHeader>

      <Separator className="md:hidden" />

      <CardContent className="md:pt-4 pt-0 pb-0">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table aria-label="Permission matrix showing feature access by role">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px] font-medium text-[13px]">
                  Module
                </TableHead>
                {roles.map((role) => (
                  <TableHead
                    key={role.name}
                    className="font-medium text-[13px] text-center"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {role.isAdmin && (
                        <Crown className="h-3.5 w-3.5 text-[#9810FA]" />
                      )}
                      {role.name}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section) => (
                <React.Fragment key={section.sectionName}>
                  <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                    <TableCell
                      colSpan={roles.length + 1}
                      className="text-[12px] font-medium text-muted-foreground py-2"
                    >
                      {section.sectionName}
                    </TableCell>
                  </TableRow>
                  {section.modules.map((module) => (
                    <TableRow
                      key={module.name}
                      className="bg-white hover:bg-gray-50"
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
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-border -mx-6">
          {sections.map((section) => (
            <React.Fragment key={section.sectionName}>
              <div className="py-2 px-6 bg-[#F9FAFB]">
                <p className="text-[11px] md:text-[12px] font-bold md:font-medium text-muted-foreground uppercase">
                  {section.sectionName}
                </p>
              </div>
              {section.modules.map((module) => {
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
            </React.Fragment>
          ))}
        </div>

        {footerNote && (
          <p className="text-[12px] text-muted-foreground py-4">{footerNote}</p>
        )}
      </CardContent>
    </Card>
  );
}
