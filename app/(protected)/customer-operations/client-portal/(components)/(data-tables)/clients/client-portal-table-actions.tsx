'use client';

import * as React from 'react';
import { MoreHorizontal, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClientPortalActions } from '@/hooks/use-client-portal-actions';
import { Client } from '@/lib/types/client';

interface ClientPortalTableActionsProps {
  client: Client;
}

export function ClientPortalTableActions({
  client,
}: ClientPortalTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Get actions and dialogs from the hook
  const { actions, viewDialog } = useClientPortalActions(client.id, client);

  const handleView = () => {
    setDropdownOpen(false); // Close dropdown before opening modal
    actions.view(); // Trigger view dialog
  };

  return (
    <div>
      {viewDialog} {/* View/Edit client modal */}

      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
