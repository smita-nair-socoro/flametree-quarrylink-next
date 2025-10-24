'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Check, X, Crown } from 'lucide-react';

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

interface PermissionMatrixProps {
  title: string;
  description: string;
  roles: PermissionRole[];
  modules: PermissionModule[];
  titleBgColor?: string;
  titleTextColor?: string;
  titleBorderColor?: string;
}

export function PermissionMatrix({
  title,
  description,
  roles,
  modules,
  titleBgColor = '#F3F4F6',
  titleTextColor = '#374151',
  titleBorderColor = '#E5E7EB',
}: PermissionMatrixProps) {
  return (
    <Card className="w-full">
      <CardHeader className="py-1">
        <div className="space-y-0.75">
          <div className="flex items-baseline gap-2">
            <h3 className="text-[13.6719px] font-normal">Permission Matrix</h3>
            <span
              className="text-[10.5px] px-1.5 py-0.5 rounded-md font-medium border"
              style={{
                backgroundColor: titleBgColor,
                color: titleTextColor,
                borderColor: titleBorderColor,
              }}
            >
              {title}
            </span>
          </div>
          <p className="text-[13.5625px] font-normal text-muted-foreground">
            {description}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Table */}
        <div className="overflow-hidden">
          {/* Table Header */}
          <div className="grid border-b">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `300px repeat(${roles.length}, 1fr)`,
              }}
            >
              <div className="px-2 py-1 font-medium text-[13.7813px]">
                Module
              </div>
              {roles.map((role, index) => (
                <div
                  key={index}
                  className="px-2 py-1 font-medium text-[13.7813px] text-center flex items-center justify-center gap-2"
                >
                  {role.isAdmin && (
                    <Crown className="h-4 w-4 text-[#9810FA]" />
                  )}
                  {role.name}
                </div>
              ))}
            </div>
          </div>

          {/* Table Body */}
          <div>
            {modules.map((module, moduleIndex) => (
              <div
                key={moduleIndex}
                className="grid"
                style={{
                  gridTemplateColumns: `300px repeat(${roles.length}, 1fr)`,
                  backgroundColor:
                    moduleIndex % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                }}
              >
                <div className="px-2 py-2 text-[13.7813px] font-medium">
                  {module.name}
                </div>
                {roles.map((role, roleIndex) => {
                  const roleKey = role.name.toLowerCase().replace(/\s+/g, '_');
                  const hasAccess = module.permissions[roleKey];
                  return (
                    <div
                      key={roleIndex}
                      className="px-4 py-3 flex items-center justify-center"
                    >
                      {hasAccess ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 px-2 py-3 bg-[#F9FAFB] rounded-md space-y-2">
          <div className="font-medium text-foreground text-[13.7813px]">
            Legend:
          </div>
          <div className="flex items-center text-[12.1078px] font-normal justify-between">
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
