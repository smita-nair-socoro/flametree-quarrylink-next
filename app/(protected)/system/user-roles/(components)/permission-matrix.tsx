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
}

export function PermissionMatrix({
  title,
  description,
  roles,
  modules,
  titleBgColor = 'bg-gray-100',
  titleTextColor = 'text-gray-700',
}: PermissionMatrixProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-semibold">Permission Matrix</h3>
            <span
              className={`text-sm px-2.5 py-0.5 rounded-md font-medium ${titleBgColor} ${titleTextColor}`}
            >
              {title}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
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
              <div className="px-4 py-3 font-medium text-sm">Module</div>
              {roles.map((role, index) => (
                <div
                  key={index}
                  className="px-4 py-3 font-medium text-sm text-center flex items-center justify-center gap-2"
                >
                  {role.isAdmin && (
                    <Crown className="h-4 w-4 text-purple-600 fill-purple-200" />
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
                <div className="px-4 py-3 text-sm font-medium">
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
        <div className="mt-6 px-4 py-3 bg-[#F9FAFB] rounded-md space-y-2">
          <div className="font-medium text-foreground text-sm">Legend:</div>
          <div className="flex items-center text-sm justify-between">
            <div className="flex items-center gap-2 w-1/3">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">Full Access</span>
            </div>
            <div className="flex items-center gap-2 w-1/3">
              <X className="h-4 w-4 text-red-500" />
              <span className="text-muted-foreground">No Access</span>
            </div>
            <div className="flex items-center gap-2 w-1/3">
              <Crown className="h-4 w-4 text-purple-600 fill-purple-200" />
              <span className="text-muted-foreground">Admin Only</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
