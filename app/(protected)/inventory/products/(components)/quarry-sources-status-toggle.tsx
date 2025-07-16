import React from 'react';
import { Switch } from '@/components/ui/switch';

interface StatusToggleProps {
  currentStatus: 'ACTIVE' | 'INACTIVE' | string;
}

export function StatusToggle({ currentStatus }: StatusToggleProps) {
  const [isActive, setIsActive] = React.useState(currentStatus === 'ACTIVE');

  React.useEffect(() => {
    setIsActive(currentStatus === 'ACTIVE');
  }, [currentStatus]);

  const handleToggle = (checked: boolean) => {
    setIsActive(checked);
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Switch checked={isActive} onCheckedChange={handleToggle} />
      <span className="text-sm text-muted-foreground">
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
}
