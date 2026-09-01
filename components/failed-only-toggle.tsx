'use client';

import * as React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function FailedOnlyToggle({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        id="failed-only"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor="failed-only" className="cursor-pointer">
        Failed only
      </Label>
    </div>
  );
}
