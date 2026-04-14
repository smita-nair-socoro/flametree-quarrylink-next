'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { DocketDTO } from '@/lib/types/docket';
import { DocketsByJobIdQueryOptions } from '@/lib/api/docket';
import { DataTableClient } from '@/components/ui/data-table-client';
import { Spinner } from '@/components/ui/spinner';
import { createInvoiceColumns } from './tabs/invoices/(data-tables)/create-invoice-columns';
import { InvoicesBulkActions } from './invoies-bulk-actions';

import rawInvoiceResponseData from '@/lib/tests/invoiceReponseData.json';
const { items } = rawInvoiceResponseData as unknown as {
  items: DocketDTO[];
};

interface FormProps {
  id?: number;
  jobId: number;
  onCancel?: () => void;
  onSuccess?: () => void;
  className?: string;
}

export default function InvoiceForm({
  id,
  jobId,
  onCancel,
  onSuccess,
  className,
}: FormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isViewDetails = Boolean(id);
  // const { data: dockets = [] } = useQuery(DocketsByJobIdQueryOptions(jobId));

  // const items: DocketDTO[] = React.useMemo(() => {
  //   const list: DocketDTO[] = Array.isArray(dockets)
  //     ? dockets
  //     : (dockets?.content ?? []);
  //   return list
  //     .filter(
  //       (docket) =>
  //         docket.docketStatus === DOCKET_STATUS.DELIVERED ||
  //         docket.docketStatus === DOCKET_STATUS.COLLECTED,
  //     )
  //     .map((docket) => ({
  //       ...docket,
  //     })) as DocketDTO[];
  // }, [dockets]);

  const [selectedDockets, setSelectedDockets] = React.useState<DocketDTO[]>([]);

  const handlRowSelectionChange = (selected: DocketDTO[]) => {
    setSelectedDockets(selected);
  };

  const handleClearSelection = () => {
    setSelectedDockets([]);
  };

  return (
    <div className="w-full relative">
      {isSubmitting && (
        <div className="fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center pt-10">
          <div className="flex flex-col items-center space-y-4 p-8">
            <Spinner size="medium" />
            <p className="text-lg text-muted-foreground font-bold">
              Creating Invoice...
            </p>
          </div>
        </div>
      )}
      <DataTableClient
        columns={createInvoiceColumns}
        data={items}
        defaultSorting={[{ id: 'docketNumber', desc: false }]}
        enableRowSelection={true}
        onRowSelectionChange={handlRowSelectionChange}
        bulkActionsSlot={
          <InvoicesBulkActions
            selectedDockets={selectedDockets}
            onClearSelection={handleClearSelection}
          />
        }
      />
    </div>
  );
}
