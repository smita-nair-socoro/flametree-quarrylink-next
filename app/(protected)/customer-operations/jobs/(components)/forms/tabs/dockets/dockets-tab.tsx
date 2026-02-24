'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

import { DataTableClient } from '@/components/ui/data-table-client';
import { docketsColumns } from './(data-tables)/columns';
import { Docket } from '@/lib/types/docket';
import { Button } from '@/components/ui/button';

interface DocketsTabProps {
  dockets: Docket[];
}

export default function DocketsTab({ dockets }: DocketsTabProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div
        className={cn(
          isDesktop
            ? 'flex justify-between items-center'
            : 'flex flex-col gap-4',
        )}
      >
        <span className="text-lg font-semibold">Dockets</span>
        {/* will be changed to a formDialog later in another task */}
        <Button>Add New Docket</Button>
      </div>

      <div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
        <DataTableClient
          columns={docketsColumns}
          data={dockets}
          simpleTable={true}
          defaultSorting={[{ id: 'docketNumber', desc: false }]}
        />
      </div>
    </div>
  );
}
