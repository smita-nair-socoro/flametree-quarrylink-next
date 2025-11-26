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
import { useClientActions } from '@/hooks/use-client-actions';
import { Client } from '@/lib/types/client';
import { useClientStore } from '@/app/stores/client-store';

interface ClientTableActionsProps {
  client: Client;
}

export function ClientTableActions({ client }: ClientTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Get actions and dialogs from the hook
  const { actions, viewDialog, confirmDialogs } = useClientActions(
    client.id,
    client
  );

  const setSelectedClient = useClientStore((state) => state.setSelectedClient);

  const handleView = () => {
    setSelectedClient(client);
    setDropdownOpen(false); // Close dropdown before opening modal
    actions.view(); // Trigger view dialog
  };

  return (
    <div>
      {confirmDialogs}
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
